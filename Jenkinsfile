// pipeline {
//     agent any
//     environment {
//         // GIT_CREDENTIALS_ID = 'github-credentials-id'
//         // GC_KEY = 'gke-credentials-id'
//         // REGISTRY_URI = 'asia-south1-docker.pkg.dev'
//         // PROJECT_ID = 'reflection01-431417'
//         // ARTIFACT_REGISTRY = 'reflection-artifacts'
//         // CLUSTER = 'reflection-cluster-1'
//         // ZONE = 'us-central1'
//         // REPO_URL = "${REGISTRY_URI}/${PROJECT_ID}/${ARTIFACT_REGISTRY}"
//         // Define COMMIT_SHA at the global environment level
//         COMMIT_SHA = ''
//     }
//     stages {
//         stage('Checkout') {
//             steps {
//                 git url: 'https://github.com/BorisSolomonia/brooks-front-react.git', branch: 'master', credentialsId: "${git}"
//                 script {
//                     COMMIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
//                     def commitMessage = sh(script: 'git log -1 --pretty=%B', returnStdout: true).trim()
//                     echo "Checked out commit: ${COMMIT_SHA}"
//                     echo "Commit message: ${commitMessage}"
//                 }
//             }
//         }
//         stage('Build and Push Image') {
//             steps {
//                 withCredentials([file(credentialsId: "${gcp}", variable: 'GC_KEY_FILE')]) {
//                     script {
//                         withEnv(["GOOGLE_APPLICATION_CREDENTIALS=${GC_KEY_FILE}", "COMMIT_SHA=${COMMIT_SHA}", "PROJECT_ID=${PROJECT_ID}"]) {
//                             sh "gcloud auth activate-service-account --key-file=${GC_KEY_FILE} --verbosity=info"
                            
//                             // Trigger Google Cloud Build with the COMMIT_SHA substitution
//                             sh '''
//                             gcloud builds submit --config=cloudbuild.yaml --substitutions=_COMMIT_SHA=${COMMIT_SHA}
//                             '''
//                         }
//                     }
//                 }
//             }
//         }
//         stage('Deploy') {
//             steps {
//                 script {
//                     // Update the Kubernetes deployment file with the correct image URL
//                     sh "sed -i 's|gcr.io/${PROJECT_ID}/reflect-react-app:latest|gcr.io/${PROJECT_ID}/reflect-react-app:${COMMIT_SHA}|g' react-frontend-deployment.yaml"
//                     withCredentials([file(credentialsId: "${gcp}", variable: 'GC_KEY_FILE')]) {
//                         // Authenticate using gcloud and deploy the updated image
//                         sh '''
//                             gcloud auth activate-service-account --key-file=${GC_KEY_FILE}
//                             gcloud config set project ${PROJECT_ID}
//                             gcloud container clusters get-credentials ${CLUSTER} --zone ${ZONE} --project ${PROJECT_ID}
//                             kubectl apply -f react-frontend-deployment.yaml
//                         '''
//                     }
//                 }
//             }
//         }
//     }
// }

pipeline {
    agent any
    environment {
        GIT_CREDENTIALS_ID = 'git'  // Change to your actual Git credentials ID
        GC_KEY = 'gcp'  // Change to your actual Google Cloud credentials ID
        REGISTRY_URI = 'us-east4-docker.pkg.dev'  // Adjust if different
        PROJECT_ID = 'brooks-437520'  // Update with correct project ID
        ARTIFACT_REGISTRY = 'brooks-artifacts'  // Update if needed
        IMAGE_NAME = 'reflect-react-app'  // Update to the correct image name
        CLUSTER = 'low-cost-cluster'  // Update to the correct GKE cluster name
        ZONE = 'us-central1-a'  // Ensure this matches the zone of your cluster
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk-amd64' // Set JAVA_HOME for WSL
        PATH = "${JAVA_HOME}/bin:${env.PATH}" // Add JAVA_HOME to the PATH for WSL
        COMMIT_SHA = ''  // Will be set dynamically
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/BorisSolomonia/brooks-front-react.git', branch: 'master', credentialsId: "${GIT_CREDENTIALS_ID}"
                script {
                    COMMIT_SHA = bat(script: "wsl -d Ubuntu-22.04 git rev-parse --short HEAD", returnStdout: true).trim()
                    def commitMessage = bat(script: "wsl -d Ubuntu-22.04 git log -1 --pretty=%B", returnStdout: true).trim()
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
                            // Authenticate with Google Cloud using WSL
                            bat "wsl -d Ubuntu-22.04 gcloud auth activate-service-account --key-file=${wslKeyFilePath} --verbosity=info"
                            
                            // Trigger Google Cloud Build with the COMMIT_SHA substitution
                            bat '''
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

                        // Update the Kubernetes deployment file with the correct image URL
                        bat '''
                        wsl -d Ubuntu-22.04 sed -i "s|gcr.io/${PROJECT_ID}/reflect-react-app:latest|gcr.io/${PROJECT_ID}/reflect-react-app:${COMMIT_SHA}|g" react-frontend-deployment.yaml
                        '''

                        // Authenticate and deploy the updated image to GKE using WSL
                        bat '''
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
