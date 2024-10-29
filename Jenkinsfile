pipeline {
    agent any
    environment {
        GIT_CREDENTIALS_ID = 'git'
        GC_KEY = 'gcp'
        REGISTRY_URI = 'us-east4-docker.pkg.dev'
        PROJECT_ID = 'brooks-437520'
        ARTIFACT_REGISTRY = 'brooks-artifacts'
        IMAGE_NAME = 'reflect-react-app'
        CLUSTER = 'low-cost-cluster'
        ZONE = 'us-central1-a'
        NODE_HOME = '/usr/local/bin'
        PATH = "${NODE_HOME}:${env.PATH}"
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/BorisSolomonia/brooks-front-react.git', branch: 'master', credentialsId: "${GIT_CREDENTIALS_ID}"
                script {
                    def commitSha = bat(script: "wsl -d Ubuntu-22.04 git rev-parse --short HEAD", returnStdout: true).trim()
                    def commitMessage = bat(script: "wsl -d Ubuntu-22.04 git log -1 --pretty=format:%%B", returnStdout: true).trim()
                    echo "Checked out commit: ${commitSha}"
                    echo "Commit message: ${commitMessage}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                bat "wsl -d Ubuntu-22.04 npm install"
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

                        bat "wsl -d Ubuntu-22.04 npx cross-env CI=false npm run build"

                        def imageTag = "v${env.BUILD_NUMBER}"
                        def imageFullName = "${REGISTRY_URI}/${PROJECT_ID}/${ARTIFACT_REGISTRY}/${IMAGE_NAME}:${imageTag}"

                        // Check if Docker is running within WSL
                        def dockerCheck = bat(script: "wsl -d Ubuntu-22.04 docker --version", returnStatus: true)
                        if (dockerCheck != 0) {
                            error("Docker is not available in WSL 2. Ensure Docker Desktop is configured for WSL.")
                        }

                        // Build and push Docker image
                        def buildExitCode = bat(script: "wsl -d Ubuntu-22.04 docker build -t ${imageFullName} .", returnStatus: true)
                        if (buildExitCode != 0) {
                            error("Docker build failed. Ensure Docker is configured correctly for WSL 2.")
                        }

                        def pushExitCode = bat(script: "wsl -d Ubuntu-22.04 docker push ${imageFullName}", returnStatus: true)
                        if (pushExitCode != 0) {
                            error("Docker push failed. Ensure Docker is configured correctly for WSL 2.")
                        }

                        // Update deployment manifest with new image
                        bat "wsl -d Ubuntu-22.04 sed -i 's|IMAGE_URL|${imageFullName}|g' reflect-react-deployment.yaml"
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
