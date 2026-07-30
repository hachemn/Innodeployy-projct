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

        stage('Docker Login') {
        steps {
            withCredentials([usernamePassword(
                credentialsId: 'dockerhub',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {

                sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                    docker tag innodeploy-backend:latest nourhenhachem/innodeploy-backend:latest
                    docker push nourhenhachem/innodeploy-backend:latest
                '''
            }
        }
}