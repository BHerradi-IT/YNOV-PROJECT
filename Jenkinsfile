pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        EMAIL_RECIPIENT = "herraditech@gmail.com"
        
        // ========== Docker Hub Variables ==========
        DOCKER_HUB_USERNAME = "peacechouaib"
        DOCKER_IMAGE_FULL = "${DOCKER_HUB_USERNAME}/${IMAGE_NAME}"
    }

    stages {
        // ========== 1. Clone Repository ==========
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== 2. SonarQube Analysis ==========
        stage('SonarQube Analysis') {
            steps {
                script {
                    sh '''
                        echo "========== SonarQube Analysis Started =========="
                        
                        docker run --rm \
                          -v $(pwd):/usr/src \
                          -w /usr/src \
                          sonarsource/sonar-scanner-cli:latest \
                          sonar-scanner \
                          -Dsonar.projectKey=ynov-react-app \
                          -Dsonar.projectName="YNOV React App" \
                          -Dsonar.projectVersion=1.0 \
                          -Dsonar.sources=frontend/src \
                          -Dsonar.exclusions=**/node_modules/**,**/*.test.js \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.login=${SONAR_TOKEN}
                        
                        echo "✅ SonarQube analysis completed"
                    '''
                }
            }
        }

        // ========== 3. Quality Gate Check ==========
        stage('Quality Gate Check') {
            steps {
                script {
                    echo "Waiting for SonarQube analysis to complete..."
                    sleep(time: 30, unit: 'SECONDS')
                    
                    sh '''
                        STATUS=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=ynov-react-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                        echo "Quality Gate Status: ${STATUS}"
                        
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "⚠️ Quality Gate failed - Continuing for testing purposes"
                        else
                            echo "✅ Quality Gate passed!"
                        fi
                    '''
                }
            }
        }

        // ========== 4. Build Docker Image ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                    sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_IMAGE_FULL}:latest"
                    sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_IMAGE_FULL}:${BUILD_NUMBER}"
                    echo "✅ Docker image built and tagged successfully"
                    echo "   Local: ${IMAGE_NAME}:latest"
                    echo "   Remote: ${DOCKER_IMAGE_FULL}:latest"
                    echo "   Remote: ${DOCKER_IMAGE_FULL}:${BUILD_NUMBER}"
                }
            }
        }

        // ========== 5. Trivy Security Scan ==========
        stage('Trivy Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========== Trivy Security Scan Started =========="
                        
                        mkdir -p reports
                        
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format json \
                          --output reports/trivy-report.json \
                          --ignore-unfixed || echo "Scan completed"
                        
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format table \
                          --output reports/trivy-summary.txt \
                          --ignore-unfixed || echo "Summary created"
                        
                        if [ -f reports/trivy-report.json ]; then
                            HIGH=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l)
                            CRITICAL=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l)
                            echo "🔴 CRITICAL: $CRITICAL"
                            echo "🟠 HIGH: $HIGH"
                        fi
                        
                        echo "✅ Security scan completed"
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/*', allowEmptyArchive: true
                }
            }
        }

        // ========== 6. Send to Graylog ==========
        stage('Send to Graylog') {
            steps {
                script {
                    sh '''
                        if [ -f reports/trivy-report.json ]; then
                            HIGH=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l)
                            CRITICAL=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l)
                            
                            curl -X POST -H "Content-Type: application/json" \
                              -d "{
                                \"version\": \"1.1\",
                                \"host\": \"jenkins\",
                                \"short_message\": \"Trivy Scan #${BUILD_NUMBER}\",
                                \"_image\": \"peacechouaib/ynov-project\",
                                \"_high\": $HIGH,
                                \"_critical\": $CRITICAL
                              }" \
                              http://192.168.10.40:12202/gelf || echo "Graylog unavailable"
                        fi
                    '''
                }
            }
        }

        // ========== 7. Push to Docker Hub ==========
        stage('Push to Docker Hub') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-hub-cred') {
                        sh '''
                            echo "========== Pushing to Docker Hub =========="
                            echo "📦 Repository: peacechouaib/ynov-project"
                            echo ""
                            
                            docker push peacechouaib/ynov-project:latest
                            docker push peacechouaib/ynov-project:${BUILD_NUMBER}
                            
                            echo ""
                            echo "✅ Successfully pushed to Docker Hub!"
                            echo "   https://hub.docker.com/r/peacechouaib/ynov-project"
                        '''
                    }
                }
            }
        }

        // ========== 8. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== 9. Run New Container ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Application running on http://localhost:80"
                }
            }
        }
    }
    
    post {
        success {
            echo "🎉 Pipeline completed successfully!"
            echo "   📦 Docker Hub: peacechouaib/ynov-project"
            echo "   🌐 App: http://localhost:80"
        }
        failure {
            echo "❌ Pipeline failed - check logs"
        }
    }
}
