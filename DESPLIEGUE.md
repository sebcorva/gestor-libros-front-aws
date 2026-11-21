# Despliegue en AWS: Libros y Letras

Adaptación del manual de clase de [`cvalverd/pet-app-angular21`](https://github.com/cvalverd/pet-app-angular21) a este proyecto: **un front y dos microservicios** en una sola EC2, con imágenes en ECR y despliegue automático desde GitHub Actions por AWS Systems Manager (SSM).

```
EC2 (gestor-libros-ec2) · Nginx :80
  ├─ /auth, /usuarios, /pagos      → contenedor auth-users        127.0.0.1:8081   (repo auth_service)
  ├─ /publicaciones, /comentarios  → contenedor gestor-biblioteca 127.0.0.1:8080   (repo gestor-biblioteca)
  └─ /                             → contenedor libros-frontend   127.0.0.1:4000   (este repo)
```

Cada repositorio tiene su propio workflow. Un push a `main` reemplaza **solo su contenedor**, todos en la misma EC2.

> La demo usa HTTP sin TLS. Usa solo datos de prueba. AWS y Oracle pueden generar cargos.

## 1. Antes de comenzar

- Laboratorio AWS activo (este manual usa **us-east-1**), con permisos para CloudFormation, EC2, SSM, S3, Secrets Manager y ECR.
- Una Oracle Autonomous Database con dos esquemas: `USUARIOS_APP` (auth-users) y `FORO_APP` (gestor-biblioteca).
- La **wallet** de esa base en formato ZIP. Es la misma para los dos microservicios.
- Una VPC con una subred pública que tenga ruta al Internet Gateway.

No pegues contraseñas, tokens ni la wallet en el chat, en los repositorios ni en capturas.

## 2. Repositorios

| Repo | Qué despliega | Workflow |
|---|---|---|
| `sebcorva/auth_service` | `auth-users` (ECR `auth-users`) | Test, publish and deploy auth-users to EC2 |
| `sebcorva/gestor-biblioteca` | `gestor-biblioteca` (ECR `gestor-biblioteca`) | Test, publish and deploy gestor-biblioteca to EC2 |
| `sebcorva/gestor-libros-front-aws` | Front (ECR `gestor-libros-front`) | Publish and deploy frontend to EC2 |

En cada repo, abre **Actions** y habilita los workflows si GitHub lo pide. **No hagas push a `main` hasta terminar el paso 6**: cada push dispara un despliegue.

## 3. Secretos en Secrets Manager

Crea **dos** secretos de tipo *Other type of secret* (pares clave/valor):

**`libros/auth-users`**

| Clave | Valor |
|---|---|
| `DB_URL` | Alias del `tnsnames.ora`, por ejemplo `q5x4fu7bstfvswj5_high` (se completa con `TNS_ADMIN=/app/wallet`) |
| `DB_USERNAME` | `USUARIOS_APP` |
| `DB_PASSWORD` | Contraseña de `USUARIOS_APP` |
| `JWT_SECRET` | Secreto Base64 de 32 bytes o más (**el mismo en los dos secretos**) |
| `ADMIN_EMAIL` | `admin@biblioteca.cl` |
| `ADMIN_PASSWORD` | Contraseña del admin inicial (debe cumplir las 6 reglas) |

**`libros/gestor-biblioteca`**

| Clave | Valor |
|---|---|
| `DB_URL` | El mismo alias |
| `DB_USERNAME` | `FORO_APP` |
| `DB_PASSWORD` | Contraseña de `FORO_APP` |
| `JWT_SECRET` | **El mismo valor** que en `libros/auth-users` |

Anota el **ARN completo** de cada secreto.

## 4. Crear la infraestructura (una sola vez)

En **CloudFormation → Create stack → With new resources**, sube `ec2/gestor-libros-ec2-stack.yml` de este repo. Usa como nombre `gestor-libros-ec2` y completa los parámetros:

| Parámetro | Valor |
|---|---|
| `VpcId` / `PublicSubnetId` | Tu VPC y tu subred pública |
| `AuthUsersSecretArn` | ARN de `libros/auth-users` |
| `ForoSecretArn` | ARN de `libros/gestor-biblioteca` |
| `OracleWalletObjectKey` | `Wallet.zip` |
| `OracleWalletBucketName` | Vacío, para que la plantilla cree un bucket privado |
| `InstanceType` | `t3.medium` (2 JVM + Node) |
| `CreateInstanceRole` / `ExistingInstanceProfileName` | `false` / `LabInstanceProfile` en AWS Academy |
| `AllowedHttpCidr` | `0.0.0.0/0` para la demo |

La plantilla crea la EC2 (Amazon Linux 2023, Docker y Nginx con las 3 rutas), el Security Group (solo puerto 80, sin SSH) y el bucket de la wallet.

Espera a que el stack quede en **CREATE_COMPLETE** y anota los outputs `InstanceId`, `WalletBucketName`, `WalletObjectKey` y `WebsiteUrl`. Después confirma en **Systems Manager → Fleet Manager** que la instancia aparece **Online**.

## 5. Subir la wallet

En **S3**, abre el bucket `WalletBucketName` y sube el ZIP **original** de la wallet, con la clave `WalletObjectKey` (por ejemplo `Wallet.zip`). El archivo `tnsnames.ora` debe quedar en la raíz del ZIP. Al arrancar, los dos microservicios descargan la wallet desde S3.

## 6. Configurar GitHub Actions en los 3 repos

Los secretos y variables **no se copian** entre repos. En cada uno, entra a **Settings → Secrets and variables → Actions**.

**Secrets (en los 3 repos):** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_SESSION_TOKEN`, todos de la misma sesión de AWS Academy. Cuando expiren, hay que actualizarlos en los 3 repos.

**Variables:**

| Variable | auth_service | gestor-biblioteca | front |
|---|---|---|---|
| `AWS_REGION` | `us-east-1` | `us-east-1` | `us-east-1` |
| `EC2_INSTANCE_ID` | `InstanceId` | `InstanceId` | `InstanceId` |
| `ORACLE_CREDENTIALS_SECRET_ARN` | ARN de `libros/auth-users` | ARN de `libros/gestor-biblioteca` | — |
| `ORACLE_WALLET_S3_BUCKET` | `WalletBucketName` | `WalletBucketName` | — |
| `ORACLE_WALLET_S3_KEY` | `WalletObjectKey` | `WalletObjectKey` | — |
| `AWS_ACCOUNT_ID` (opcional) | — | — | ID de la cuenta |

## 7. Primer despliegue (en este orden)

1. **auth_service** → Actions → *Run workflow* en `main`. Corre los tests, publica `auth-users:<sha>` y lo despliega. El smoke test espera que `GET http://<IP>/usuarios/me` responda **401**.
2. **gestor-biblioteca** → *Run workflow*. El smoke test espera que `GET http://<IP>/publicaciones` responda **200**.
3. **front** → *Run workflow*. Despliega `libros-frontend` y comprueba `/` y `/publicaciones`. En el job aparece `Website: http://<IP>/`.

Los microservicios se despliegan primero porque el smoke test del front consulta `/publicaciones`.

## 8. Verificar

En `http://<IP>/` recorre:

1. Regístrate con un usuario nuevo y comprueba que el login es automático.
2. Hazte premium (pago simulado) y verifica el comprobante.
3. Publica una reseña, comenta y edita tu perfil.
4. Cierra sesión y recupera la contraseña.
5. Entra como `admin@biblioteca.cl` → **Administrar usuarios** y elimina el usuario de prueba.

Al terminar, en `http://<IP>/publicaciones` debe aparecer la lista de reseñas en JSON.

Después de esto, cada push a `main` en cualquiera de los 3 repos redespliega solo ese componente.

## 9. Problemas frecuentes

| Síntoma | Qué revisar |
|---|---|
| Credenciales inválidas en Actions | Los 3 secrets de AWS Academy expiraron o son de sesiones distintas |
| La instancia no aparece Online en SSM | Que esté encendida, su perfil (`LabInstanceProfile`) y su salida a Internet |
| auth-users o gestor-biblioteca no levanta (falla el health check) | ARN del secreto, claves `DB_*` y `JWT_SECRET`, bucket y clave de la wallet, y acceso de red a Oracle |
| Login funciona pero publicar o comentar da 401 | `JWT_SECRET` distinto entre los dos secretos |
| El front carga pero dice "No pudimos conectar con el servidor" | El microservicio correspondiente no está corriendo; revisa su workflow |
| La web dejó de abrir tras reiniciar la EC2 | La IP pública cambia; revisa la IP actual en EC2 |

## 10. Al terminar

Elimina el stack `gestor-libros-ec2`. El bucket de la wallet se **retiene**: vacíalo y bórralo a mano si ya no lo necesitas. Revisa también los repos ECR (`gestor-libros-front`, `auth-users` y `gestor-biblioteca`) y los dos secretos.
