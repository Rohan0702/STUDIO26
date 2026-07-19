@echo off
echo ===================================================
echo   Deploying Apex Ops to Google Cloud Run
echo ===================================================

echo.
echo [1/3] Setting Google Cloud project ID to studio26-502918...
call gcloud config set project studio26-502918

echo.
echo [2/3] Enabling Google Cloud APIs (Cloud Run, Cloud Build, Artifact Registry)...
call gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

echo.
echo Loading environment variables from OTP-Authentication\.env ...
if not exist "OTP-Authentication\.env" (
  echo Error: OTP-Authentication\.env file not found. Please create one with credentials.
  pause
  exit /b 1
)

for /f "usebackq delims=" %%x in ("OTP-Authentication\.env") do (
  set "%%x"
)

echo.
echo [3/3] Deploying to Cloud Run...
call gcloud run deploy studio26-apex-ops ^
  --source . ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars "MONGO_URI=%MONGO_URI%,EMAIL_USER=%EMAIL_USER%,EMAIL_PASSWORD=%EMAIL_PASSWORD%,SARVAM_API_KEY=%SARVAM_API_KEY%"

echo.
echo Deployment script complete!
pause
