pipeline {
    agent any

    environment {
        // ========== Application Settings ==========
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        
        // ========== SonarQube (على الخادم البعيد) ==========
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        
        // ========== Docker Hub ==========
        DOCKER_HUB_USERNAME = "peacechouaib"
        DOCKER_HUB_IMAGE = "ynov-project"
        
        // ========== Email ==========
        EMAIL_RECIPIENT = "herraditech@gmail.com"
        
        // ========== Prometheus + Grafana (على الخادم البعيد) ==========
        PROMETHEUS_PUSHGATEWAY = "http://192.168.142.143:9091"
        PROMETHEUS_URL = "http://192.168.142.143:9090"
        GRAFANA_URL = "http://192.168.142.143:3000"
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
                        echo "========================================="
                        echo "🔍 SonarQube Analysis Started"
                        echo "========================================="
                        
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
                    echo "⏳ Waiting for SonarQube analysis..."
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

        // ========== 4. Build Docker Image ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                    sh "docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${BUILD_NUMBER}"
                    echo "✅ Docker image built: ${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        // ========== 5. Trivy Security Scan ==========
        stage('Trivy Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========================================="
                        echo "🔒 Trivy Security Scan Started"
                        echo "========================================="
                        
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
                        
                        echo ""
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

        // ========== 6. Send Metrics to Prometheus ==========
        stage('Send Metrics to Prometheus') {
            steps {
                script {
                    sh '''
                        echo "========================================="
                        echo "📈 Sending Metrics to Prometheus"
                        echo "📍 Pushgateway: ${PROMETHEUS_PUSHGATEWAY}"
                        echo "========================================="
                        
                        HIGH_COUNT=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l || echo "0")
                        CRITICAL_COUNT=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l || echo "0")
                        
                        echo "🔴 HIGH Vulnerabilities: $HIGH_COUNT"
                        echo "🔴 CRITICAL Vulnerabilities: $CRITICAL_COUNT"
                        
                        # إرسال المقاييس إلى Pushgateway
                        curl -X POST \
                          -H "Content-Type: text/plain" \
                          --data-binary "# TYPE jenkins_build_info gauge
                        jenkins_build_info{build_number=\"${BUILD_NUMBER}\",job=\"${JOB_NAME}\",status=\"success\"} 1
                        # TYPE trivy_vulnerabilities gauge
                        trivy_vulnerabilities{severity=\"HIGH\"} ${HIGH_COUNT}
                        trivy_vulnerabilities{severity=\"CRITICAL\"} ${CRITICAL_COUNT}" \
                          ${PROMETHEUS_PUSHGATEWAY}/metrics/job/jenkins_builds/instance/${JOB_NAME}
                        
                        echo ""
                        echo "✅ Metrics sent to ${PROMETHEUS_PUSHGATEWAY}"
                    '''
                }
            }
        }

        // ========== 7. Push to Docker Hub ==========
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "========================================="
                    echo "🐳 Pushing to Docker Hub"
                    echo "========================================="
                    
                    withDockerRegistry(credentialsId: 'docker-hub-cred') {
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                    }
                    
                    echo "✅ Image pushed: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                }
            }
        }

        // ========== 8. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                    echo "✅ Old container removed"
                }
            }
        }

        // ========== 9. Run New Container ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "========================================="
                    echo "✅ Application is running on port 80"
                    echo "========================================="
                }
            }
        }
    }
    
    // ========== Post Pipeline Actions ==========
    post {
        success {
            script {
                emailext(
                    subject: "✅ Pipeline SUCCESS - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        ✅ Pipeline completed successfully!
                        
                        Build: ${JOB_NAME} #${BUILD_NUMBER}
                        Status: SUCCESS
                        
                        SonarQube: ${SONAR_HOST_URL}
                        Prometheus: ${PROMETHEUS_URL}
                        Grafana: ${GRAFANA_URL}
                        Docker Hub: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}
                        Application: http://localhost:80
                        
                        Build URL: ${BUILD_URL}
                        
                        ---
                        Jenkins Pipeline
                    """,
                    to: "${EMAIL_RECIPIENT}",
                    attachmentsPattern: "reports/trivy-scan.txt, reports/trivy-report.json"
                )
                echo ""
                echo "========================================="
                echo "✅ PIPELINE COMPLETED SUCCESSFULLY!"
                echo "========================================="
                echo "📊 SonarQube: ${SONAR_HOST_URL}"
                echo "📈 Prometheus: ${PROMETHEUS_URL}"
                echo "📊 Grafana: ${GRAFANA_URL}"
                echo "🐳 Docker Hub: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                echo "🌐 Application: http://localhost:80"
                echo "========================================="
            }
        }
        failure {
            script {
                emailext(
                    subject: "❌ Pipeline FAILED - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                        ❌ Pipeline failed!
                        
                        Build: ${JOB_NAME} #${BUILD_NUMBER}
                        Status: FAILED
                        
                        Check Jenkins logs for details:
                        ${BUILD_URL}
                        
                        ---
                        Jenkins Pipeline
                    """,
                    to: "${EMAIL_RECIPIENT}",
                    attachmentsPattern: "reports/trivy-scan.txt, reports/trivy-report.json"
                )
                echo ""
                echo "========================================="
                echo "❌ PIPELINE FAILED!"
                echo "========================================="
                echo "Check Jenkins logs: ${BUILD_URL}"
                echo "========================================="
            }
        }
    }
}
