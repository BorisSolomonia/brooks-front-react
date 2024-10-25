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
                script {
                    // Get commit SHA and commit message
                    def commitSha = bat(script: "wsl -d Ubuntu-22.04 git rev-parse --short HEAD", returnStdout: true).trim()
                    def commitMessage = bat(script: "wsl -d Ubuntu-22.04 git log -1 --pretty=%B", returnStdout: true).trim()
                    echo "Checked out commit: ${commitSha}"
                    echo "Commit message: ${commitMessage}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                bat "wsl -d Ubuntu-22.04 npm ci"  // Clean install all dependencies
            }
        }

        stage('Build and Push Image') {
            steps {
                withCredentials([file(credentialsId: GC_KEY, variable: 'GC_KEY_FILE')]) {
                    script {
                        def wslKeyFilePath = GC_KEY_FILE.replace('\\', '/').replace('C:', '/mnt/c')
                        withEnv(["GOOGLE_APPLICATION_CREDENTIALS=${wslKeyFilePath}"]) {
                            bat "wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath} --verbosity=debug"
                            bat "wsl -d Ubuntu-22.04 gcloud auth configure-docker ${REGISTRY_URI}"
                        }

                        // Use `cross-env` for compatibility in setting `CI=false` during build
                        bat "wsl -d Ubuntu-22.04 cross-env CI=false npm run build"

                        def imageTag = "v${env.BUILD_NUMBER}"
                        def imageFullName = "${REGISTRY_URI}/${PROJECT_ID}/${ARTIFACT_REGISTRY}/${IMAGE_NAME}:${imageTag}"

                        // Build and push Docker image
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
                        def wslKeyFilePath = GC_KEY_FILE.replace('\\', '/').replace('C:', '/mnt/c')
                        bat "wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath} --verbosity=debug"
                        bat "wsl -d Ubuntu-22.04 gcloud container clusters get-credentials ${CLUSTER} --zone ${ZONE} --project ${PROJECT_ID}"
                        bat "wsl -d Ubuntu-22.04 kubectl apply -f reflect-react-deployment.yaml"
                    }
                }
            }
        }
    }
}
