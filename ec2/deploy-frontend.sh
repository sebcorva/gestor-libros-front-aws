#!/usr/bin/env bash
set -Eeuo pipefail

image="${1:?image URI is required}"
region="${2:?AWS region is required}"
if [[ ! "$image" =~ ^[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com/gestor-libros-front:[0-9a-f]{40}$ ]]; then
  echo "Invalid frontend ECR image URI." >&2
  exit 2
fi
if [[ ! "$region" =~ ^[a-z0-9-]+$ ]]; then
  echo "Invalid AWS region." >&2
  exit 2
fi

registry="${image%%/*}"
docker_config="$(mktemp -d /tmp/libros-ecr-docker.XXXXXX)"
export DOCKER_CONFIG="$docker_config"
cleanup_auth() {
  if [[ -n "$docker_config" ]]; then
    rm -rf -- "$docker_config"
    docker_config=""
  fi
}
trap cleanup_auth EXIT

aws ecr get-login-password --region "$region" \
  | docker login --username AWS --password-stdin "$registry" >/dev/null
docker pull "$image"
docker logout "$registry" >/dev/null 2>&1 || true
rm -f -- "$docker_config/config.json"

backup=""
new_container_attempted=false
rollback() {
  status=$?
  trap - EXIT
  if (( status != 0 )); then
    if [[ "$new_container_attempted" == true ]] && docker inspect libros-frontend >/dev/null 2>&1; then
      docker rm -f libros-frontend >/dev/null
    fi
    if [[ -n "$backup" ]] && docker inspect "$backup" >/dev/null 2>&1; then
      docker rename "$backup" libros-frontend
      docker start libros-frontend
      echo "Frontend deployment failed; previous container restored." >&2
    fi
  fi
  cleanup_auth
  exit "$status"
}
trap rollback EXIT

if docker inspect libros-frontend >/dev/null 2>&1; then
  backup="libros-frontend-rollback-$(date +%s%N)"
  docker rename libros-frontend "$backup"
  docker stop "$backup" >/dev/null || true
fi

new_container_attempted=true
docker run -d \
  --name libros-frontend \
  --restart unless-stopped \
  --publish 127.0.0.1:4000:4000 \
  "$image" >/dev/null

healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:4000/ >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  echo "Frontend health check failed on port 4000." >&2
  exit 1
fi

if [[ -n "$backup" ]]; then
  docker rm "$backup" >/dev/null
fi
backup=""
cleanup_auth
trap - EXIT
echo "Frontend deployed successfully: $image"
