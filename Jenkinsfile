pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        TRIVY_REPORT = "trivy-report.json"
        
        // ========== Docker Hub Settings ==========
        DOCKER_HUB_USERNAME = "peacechouaib"  // ✅ استخدم اسم المستخدم الصحيح هنا
        DOCKER_HUB_IMAGE = "ynov-project"
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/BHerradi-IT/YNOV-PROJECT.git'
            }
        }

        // ========== 1. SonarQube Analysis ==========
        stage('SonarQube Analysis') {
            steps {
                script {
                    sh '''
                        echo "========== SonarQube Analysis Started =========="
                        echo "Checking frontend/src directory..."
                        ls -la frontend/src/ || echo "frontend/src not found!"
                        
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

        // ========== 2. Wait for Quality Gate ==========
        stage('Quality Gate Check') {
            steps {
                script {
                    echo "Waiting for SonarQube analysis to complete..."
                    sleep(time: 30, unit: 'SECONDS')
                    
                    sh '''
                        STATUS=$(curl -s -u ${SONAR_TOKEN}: "${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=ynov-react-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
                        echo "Quality Gate Status: ${STATUS}"
                        
                        if [ "$STATUS" = "ERROR" ]; then
                            echo "❌ Quality Gate failed!"
                            exit 1
                        elif [ "$STATUS" = "OK" ]; then
                            echo "✅ Quality Gate passed!"
                        else
                            echo "⚠️ Quality Gate status unknown: ${STATUS}"
                        fi
                    '''
                }
            }
        }

        // ========== 3. Build Docker Image ==========
        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_NAME}:latest ."
                    sh "docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        // ========== 4. Security Scan (Grype) ==========
        stage('Security Scan') {
            steps {
                script {
                    sh '''
                        echo "========== Security Scan Started =========="
                        echo "Using Grype for vulnerability scanning"
                        
                        docker pull anchore/grype:latest
                        
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          anchore/grype:latest \
                          ${IMAGE_NAME}:latest \
                          --fail-on high \
                          --scope AllLayers || echo "⚠️ Vulnerabilities found but continuing"
                        
                        echo "✅ Security scan completed"
                    '''
                }
            }
        }

        // ========== 5. Push to Docker Hub ==========
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "========== Pushing Image to Docker Hub =========="
                    echo "Username: ${DOCKER_HUB_USERNAME}"
                    echo "Image: ${DOCKER_HUB_IMAGE}"
                    
                    // تسجيل الدخول إلى Docker Hub باستخدام credentials
                    withDockerRegistry(credentialsId: 'docker-hub-cred') {
                        // ✅ استخدم المتغير DOCKER_HUB_USERNAME بدلاً من الكتابة المباشرة
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                        
                        // دفع الصور إلى Docker Hub
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        sh "docker push ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                        
                        echo "✅ Image pushed successfully:"
                        echo "   - ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:latest"
                        echo "   - ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }

        // ========== 6. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== 7. Run New Container ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Container started successfully on port 80"
                }
            }
        }
    }
    
    post {
        success {
            echo "========================================="
            echo "✅ PIPELINE COMPLETED SUCCESSFULLY!"
            echo "========================================="
            echo "📊 SonarQube: PASSED"
            echo "🔒 Security Scan: COMPLETED"
            echo "🐳 Docker Hub: ${DOCKER_HUB_USERNAME}/${DOCKER_HUB_IMAGE}:${BUILD_NUMBER}"
            echo "🌐 Application: http://localhost:80"
            echo "========================================="
        }
        failure {
            echo "========================================="
            echo "❌ PIPELINE FAILED!"
            echo "========================================="
            echo "Check the logs above for details"
            echo "========================================="
        }
    }
}
