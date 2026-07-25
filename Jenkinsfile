pipeline {
    agent any

    stages {

        stage('Informations') {
            steps {
                echo '=== Welcome to InnoDeploy CI ==='
                sh 'pwd'
                sh 'ls -la'
            }
        }

        stage('Docker') {
            steps {
                sh 'docker --version'
            }
        }

        stage('Finished') {
            steps {
                echo 'Pipeline completed successfully!'
            }
        }
    }
}
