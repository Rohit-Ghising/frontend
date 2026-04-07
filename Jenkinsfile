pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = 'gadgetzone-frontend'
        VITE_API_URL = 'http://127.0.0.1:8000'
    }

    stages {
        stage('Build Frontend Image') {
            steps {
                script {
                    def command = "docker build --build-arg VITE_API_URL=${env.VITE_API_URL} -t ${env.FRONTEND_IMAGE}:${env.BUILD_NUMBER} -t ${env.FRONTEND_IMAGE}:latest -f Dockerfile ."
                    if (isUnix()) {
                        sh command
                    } else {
                        bat command
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Frontend Docker image was built successfully.'
        }
    }
}
