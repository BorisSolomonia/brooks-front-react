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
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk-amd64'
        PATH = "${JAVA_HOME}/bin:${env.PATH}"
        COMMIT_SHA = ''
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/BorisSolomonia/brooks-front-react.git', branch: 'master', credentialsId: "${GIT_CREDENTIALS_ID}"
                script {
                    // Get the short commit hash using sh instead of bat
                    COMMIT_SHA = sh(script: "wsl -d Ubuntu-22.04 git rev-parse --short HEAD", returnStdout: true).trim()
                    
                    // Get the full commit message with the correct format
                    def commitMessage = sh(script: "wsl -d Ubuntu-22.04 git log -1 --pretty=%B", returnStdout: true).trim()

                    echo "Checked out commit: ${COMMIT_SHA}"
                    echo "Commit message: ${commitMessage}"
                }
            }
        }
        stage('Build and Push Image') {
            steps {
                withCredentials([file(credentialsId: GC_KEY, variable: 'GC_KEY_FILE')]) {
                    script {
                        // Translate the key file path to be compatible with WSL
                        def wslKeyFilePath = GC_KEY_FILE.replace('\\', '/').replace('C:', '/mnt/c')

                        withEnv(["GOOGLE_APPLICATION_CREDENTIALS=${wslKeyFilePath}", "COMMIT_SHA=${COMMIT_SHA}"]) {
                            // Authenticate with Google Cloud using sh instead of bat
                            sh "wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath} --verbosity=info"
                            
                            // Trigger Google Cloud Build with the COMMIT_SHA substitution
                            sh '''
                            wsl -d Ubuntu-22.04 gcloud builds submit --config=cloudbuild.yaml --substitutions=_COMMIT_SHA=${COMMIT_SHA}
                            '''
                        }
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

                        // Update the Kubernetes deployment file with the correct image URL using sh instead of bat
                        sh '''
                        wsl -d Ubuntu-22.04 sed -i "s|gcr.io/${PROJECT_ID}/reflect-react-app:latest|gcr.io/${PROJECT_ID}/reflect-react-app:${COMMIT_SHA}|g" react-frontend-deployment.yaml
                        '''

                        // Authenticate and deploy the updated image to GKE using sh instead of bat
                        sh '''
                        wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath}
                        wsl -d Ubuntu-22.04 gcloud config set project ${PROJECT_ID}
                        wsl -d Ubuntu-22.04 gcloud container clusters get-credentials ${CLUSTER} --zone ${ZONE} --project ${PROJECT_ID}
                        wsl -d Ubuntu-22.04 kubectl apply -f react-frontend-deployment.yaml
                        '''
                    }
                }
            }
        }
    }
}
