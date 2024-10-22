pipeline {
    agent any
    environment {
        GIT_CREDENTIALS_ID = 'git'  // Git credentials ID
        GC_KEY = 'gcp'  // Google Cloud credentials ID
        REGISTRY_URI = 'us-east4-docker.pkg.dev'  // Artifact Registry region
        PROJECT_ID = 'brooks-437520'  // GCP Project ID
        ARTIFACT_REGISTRY = 'brooks-artifacts'  // Artifact Registry name
        IMAGE_NAME = 'reflect-react-app'  // Update with the correct image name
        CLUSTER = 'low-cost-cluster'  // GKE Cluster name
        ZONE = 'us-central1-a'  // GKE Cluster zone
        NODE_HOME = '/usr/local/bin/node'  // Path to Node.js for WSL
        PATH = "${NODE_HOME}:${env.PATH}"  // Add Node.js to PATH for WSL
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/BorisSolomonia/brooks-front-react.git', branch: 'master', credentialsId: "${GIT_CREDENTIALS_ID}"
            }
        }
        stage('Build and Push Image') {
            steps {
                withCredentials([file(credentialsId: GC_KEY, variable: 'GC_KEY_FILE')]) {
                    script {
                        // Translate the key file path to be compatible with WSL
                        def wslKeyFilePath = GC_KEY_FILE.replace('\\', '/').replace('C:', '/mnt/c')

                        withEnv(["GOOGLE_APPLICATION_CREDENTIALS=${wslKeyFilePath}"]) {
                            // Authenticate with Google Cloud using WSL
                            bat "wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath} --verbosity=debug"
                            bat "wsl -d Ubuntu-22.04 gcloud auth configure-docker ${REGISTRY_URI}"
                        }

                        // Run npm build for the React frontend
                        bat "wsl -d Ubuntu-22.04 npm install"
                        bat "wsl -d Ubuntu-22.04 npm run build"

                        def imageTag = "v${env.BUILD_NUMBER}"
                        def imageFullName = "${REGISTRY_URI}/${PROJECT_ID}/${ARTIFACT_REGISTRY}/${IMAGE_NAME}:${imageTag}"

                        // Build and push Docker image using Docker CLI
                        bat "wsl -d Ubuntu-22.04 docker build -t ${imageFullName} ."
                        bat "wsl -d Ubuntu-22.04 docker push ${imageFullName}"

                        // Update deployment manifest with new image
                        bat "wsl -d Ubuntu-22.04 sed -i \"s|IMAGE_URL|${imageFullName}|g\" reflect-react-deployment.yaml"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                withCredentials([file(credentialsId: GC_KEY, variable: 'GC_KEY_FILE')]) {
                    script {
                        // Translate the key file path to be compatible with WSL
                        def wslKeyFilePath = GC_KEY_FILE.replace('\\', '/').replace('C:', '/mnt/c')

                        // Authenticate and deploy to GKE using WSL
                        bat "wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath} --verbosity=debug"
                        bat "wsl -d Ubuntu-22.04 gcloud container clusters get-credentials ${CLUSTER} --zone ${ZONE} --project ${PROJECT_ID}"
                        bat "wsl -d Ubuntu-22.04 kubectl apply -f reflect-react-deployment.yaml"
                    }
                }
            }
        }
    }
}
//