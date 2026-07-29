pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('apps/backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('apps/backend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('apps/backend') {
                    sh '''
                        docker build -t innodeploy-backend:latest .
                    '''
                }
            }
        }

        stage('Docker Version') {
            steps {
                sh 'docker --version'
            }
        }
    }

    post {
        success {
            echo '✅ Build completed successfully!'
        }

        failure {
            echo '❌ Build failed!'
        }
    }
}