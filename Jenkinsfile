pipeline {
    agent any

    environment {
        // ========== Application Settings ==========
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        
        // ========== SonarQube ==========
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        
        // ========== Docker Hub ==========
        DOCKER_HUB_USERNAME = "peacechouaib"
        DOCKER_HUB_IMAGE = "ynov-project"
        
        // ========== Email ==========
        EMAIL_RECIPIENT = "herraditech@gmail.com"
        
        // ========== Prometheus ==========
        PROMETHEUS_PUSHGATEWAY = "http://192.168.142.143:9091"
        PROMETHEUS_URL = "http://192.168.142.143:9090"
        GRAFANA_URL = "http://192.168.142.143:3000"
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

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

        stage('Quality Gate Check') {
            steps {
                script {
                    echo "Waiting for SonarQube analysis..."
                    sleep(time: 30, unit: 'SECONDS')
                    
                    sh '''
                        STATUS=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=ynov-react-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                        echo "Quality Gate Status: ${STATUS}"
                        
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "❌ Quality Gate failed!"
                            exit 1
                        else
                            echo "✅ Quality Gate passed!"
                        fi
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                    sh "docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========== Trivy Security Scan Started =========="
                        
                        mkdir -p reports
                        
                        docker pull aquasec/trivy:0.59.0
                        
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:0.59.0 \
                          image ${IMAGE_NAME}:latest \
                          --severity HIGH,CRITICAL \
                          --format table \
                          --output reports/trivy-scan.txt || true
                        
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:0.59.0 \
                          image ${IMAGE_NAME}:latest \
                          --format json \
                          --output reports/trivy-report.json || true
                        
                        echo "========================================="
                        echo "📊 Trivy Scan Summary"
                        echo "========================================="
                        cat reports/trivy-scan.txt || echo "No vulnerabilities found"
                        echo "========================================="
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Send Metrics to Prometheus') {
            steps {
                script {
                    sh '''
                        echo "========== Sending Metrics to Prometheus =========="
                        echo "Pushgateway: ${PROMETHEUS_PUSHGATEWAY}"
                        
                        HIGH_COUNT=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l || echo "0")
                        CRITICAL_COUNT=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l || echo "0")
                        
                        echo "🔴 HIGH: $HIGH_COUNT"
                        echo "🔴 CRITICAL: $CRITICAL_COUNT"
                        
                        cat <<EOF | curl --data-binary @- ${PROMETHEUS_PUSHGATEWAY}/metrics/job/jenkins_builds/instance/${JOB_NAME}
                        # TYPE jenkins_build_info gauge
                        jenkins_build_info{build_number="${BUILD_NUMBER}",job="${JOB_NAME}",status="success"} 1
                        # TYPE trivy_vulnerabilities gauge
                        trivy_vulnerabilities{severity="HIGH"} ${HIGH_COUNT}
                        trivy_vulnerabilities{severity="CRITICAL"} ${CRITICAL_COUNT}
                        EOF
                        
                        echo "✅ Metrics sent to ${PROMETHEUS_PUSHGATEWAY}"
                    '''
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker-hub-cred') {
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Application running on port 80"
                }
            }
        }
    }
    
    post {
        success {
            script {
                emailext(
                    subject: "✅ Pipeline SUCCESS - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        ✅ Pipeline completed successfully!
                        
                        Build: ${JOB_NAME} #${BUILD_NUMBER}
                        
                        📊 SonarQube: ${SONAR_HOST_URL}
                        📈 Prometheus: ${PROMETHEUS_URL}
                        📊 Grafana: ${GRAFANA_URL}
                        🐳 Docker Hub: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}
                        
                        Build URL: ${BUILD_URL}
                    """,
                    to: "${EMAIL_RECIPIENT}",
                    attachmentsPattern: "reports/trivy-scan.txt, reports/trivy-report.json"
                )
            }
            echo "✅ PIPELINE COMPLETED SUCCESSFULLY!"
        }
        failure {
            script {
                emailext(
                    subject: "❌ Pipeline FAILED - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: "Pipeline failed! Check Jenkins logs: ${BUILD_URL}",
                    to: "${EMAIL_RECIPIENT}",
                    attachmentsPattern: "reports/trivy-scan.txt, reports/trivy-report.json"
                )
            }
            echo "❌ PIPELINE FAILED!"
        }
    }
}
