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
                    sh 'npx prisma generate'
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
                        docker build -t innodeploy-backend:${BUILD_NUMBER} .
                    '''
                }
            }
        }

        stage('Docker Version') {
            steps {
                sh 'docker --version'
            }
        }

        stage('Login to GitHub Container Registry') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-ghcr',
                    usernameVariable: 'GITHUB_USER',
                    passwordVariable: 'GITHUB_TOKEN'
                )]) {
                    sh '''
                        echo "$GITHUB_TOKEN" | docker login ghcr.io \
                        -u "$GITHUB_USER" \
                        --password-stdin
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                sh '''
                    docker tag innodeploy-backend:${BUILD_NUMBER} ghcr.io/hachemn/innodeploy-backend:${BUILD_NUMBER}
                    docker push ghcr.io/hachemn/innodeploy-backend:${BUILD_NUMBER}
                '''
            }
        }
        stage('Update GitOps Repository') {
            steps {
                dir('gitops') {
                    git branch: 'main',
                        credentialsId: 'github-token',
                        url: 'https://github.com/hachemn/Innodeployy-gitops.git'

                    sh '''
                        sed -i "s|ghcr.io/hachemn/innodeploy-backend:.*|ghcr.io/hachemn/innodeploy-backend:${BUILD_NUMBER}|" apps/backend/deployment.yaml

                        git add apps/backend/deployment.yaml
                        git commit -m "chore: deploy backend ${BUILD_NUMBER}"
                        git push origin main
                    '''
                }
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
