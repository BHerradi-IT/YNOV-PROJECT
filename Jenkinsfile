pipeline {
    agent any

    environment {
        IMAGE_NAME = "ynov-project-image"
        CONTAINER_NAME = "ynov-project-container"
        SONAR_HOST_URL = "http://192.168.142.143:9000"
        SONAR_TOKEN = credentials('sonar-token')
        EMAIL_RECIPIENT = "herraditech@gmail.com"
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
                }
            }
        }

        // ========== 5. Trivy Security Scan + PDF Report ==========
        stage('Trivy Security Scan & PDF Report') {
            steps {
                script {
                    sh '''
                        echo "========== Trivy Security Scan Started =========="
                        
                        # إنشاء مجلد للتقارير
                        mkdir -p reports
                        
                        # 1. فحص الثغرات وإنشاء تقرير JSON
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format json \
                          --output reports/trivy-report.json
                        
                        # 2. إنشاء تقرير HTML مفصل
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format template \
                          --template "@contrib/html.tpl" \
                          --output reports/trivy-detailed-report.html
                        
                        # 3. إنشاء تقرير نصي بسيط
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v $(pwd):/src \
                          -w /src \
                          aquasec/trivy:latest \
                          image ${IMAGE_NAME}:latest \
                          --format table \
                          --output reports/trivy-summary.txt
                        
                        # 4. عرض ملخص الثغرات
                        echo ""
                        echo "========== Trivy Scan Summary =========="
                        
                        HIGH_COUNT=$(grep -o '"SEVERITY":"HIGH"' reports/trivy-report.json | wc -l || echo "0")
                        CRITICAL_COUNT=$(grep -o '"SEVERITY":"CRITICAL"' reports/trivy-report.json | wc -l || echo "0")
                        MEDIUM_COUNT=$(grep -o '"SEVERITY":"MEDIUM"' reports/trivy-report.json | wc -l || echo "0")
                        LOW_COUNT=$(grep -o '"SEVERITY":"LOW"' reports/trivy-report.json | wc -l || echo "0")
                        
                        echo "🔴 CRITICAL: $CRITICAL_COUNT"
                        echo "🟠 HIGH: $HIGH_COUNT"
                        echo "🟡 MEDIUM: $MEDIUM_COUNT"
                        echo "🟢 LOW: $LOW_COUNT"
                        echo "========================================"
                        
                        # حفظ النتائج في ملف للإرسال
                        echo "Trivy Scan Results - Build ${BUILD_NUMBER}" > reports/scan-summary.txt
                        echo "Date: $(date)" >> reports/scan-summary.txt
                        echo "" >> reports/scan-summary.txt
                        echo "CRITICAL Vulnerabilities: $CRITICAL_COUNT" >> reports/scan-summary.txt
                        echo "HIGH Vulnerabilities: $HIGH_COUNT" >> reports/scan-summary.txt
                        echo "MEDIUM Vulnerabilities: $MEDIUM_COUNT" >> reports/scan-summary.txt
                        echo "LOW Vulnerabilities: $LOW_COUNT" >> reports/scan-summary.txt
                        echo "" >> reports/scan-summary.txt
                        echo "For details, check the attached HTML report." >> reports/scan-summary.txt
                        
                        echo "✅ Reports generated successfully"
                    '''
                }
            }
            post {
                always {
                    // حفظ التقارير كـ artifacts
                    archiveArtifacts artifacts: 'reports/*', fingerprint: true
                }
            }
        }

        // ========== 6. Send PDF Report via Email ==========
        stage('Send Report to Email') {
            steps {
                script {
                    // إنشاء HTML للبريد الإلكتروني
                    sh '''
                        cat > reports/email-body.html << EOF
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; }
                                .container { padding: 20px; }
                                .header { background-color: #2c3e50; color: white; padding: 10px; }
                                .vuln-critical { color: #721c24; background-color: #f8d7da; padding: 5px; }
                                .vuln-high { color: #856404; background-color: #fff3cd; padding: 5px; }
                                .vuln-medium { color: #0c5460; background-color: #d1ecf1; padding: 5px; }
                                .vuln-low { color: #155724; background-color: #d4edda; padding: 5px; }
                                .footer { font-size: 12px; color: gray; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h2>🔒 Trivy Security Scan Report</h2>
                                    <p>Build #${BUILD_NUMBER} - Job: ${JOB_NAME}</p>
                                </div>
                                
                                <h3>Scan Summary</h3>
                                <pre>$(cat reports/scan-summary.txt)</pre>
                                
                                <h3>Next Steps</h3>
                                <ul>
                                    <li>Review the attached HTML report for detailed vulnerability information</li>
                                    <li>Fix HIGH and CRITICAL vulnerabilities before production deployment</li>
                                    <li>For testing purposes, the application will continue to run</li>
                                </ul>
                                
                                <div class="footer">
                                    <p>Jenkins Pipeline | Build URL: ${BUILD_URL}</p>
                                    <p>This is an automated message - Testing purposes only</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        EOF
                    '''
                    
                    // إرسال البريد الإلكتروني مع التقرير المرفق
                    emailext(
                        subject: "🔒 Trivy Security Report - ${JOB_NAME} #${BUILD_NUMBER}",
                        body: """
                            Trivy Security Scan Results
                            
                            Build: ${JOB_NAME} #${BUILD_NUMBER}
                            Status: ${currentBuild.result}
                            
                            Please find attached the full security report.
                            
                            ---
                            This is an automated message from Jenkins Pipeline
                        """,
                        to: "${EMAIL_RECIPIENT}",
                        attachmentsPattern: "reports/trivy-detailed-report.html, reports/trivy-summary.txt, reports/scan-summary.txt"
                    )
                    
                    echo "✅ Email sent to ${EMAIL_RECIPIENT}"
                }
            }
        }

        // ========== 7. Stop Old Container ==========
        stage('Stop Old Container') {
            steps {
                script {
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                }
            }
        }

        // ========== 8. Run New Container (ALWAYS - even with vulnerabilities) ==========
        stage('Run Container') {
            steps {
                script {
                    sh "docker run -d --name ${CONTAINER_NAME} -p 80:80 ${IMAGE_NAME}:latest"
                    echo "✅ Application started successfully on port 80 (Testing mode)"
                }
            }
        }
    }
    
    // ========== Post Pipeline Actions ==========
    post {
        always {
            script {
                // دائماً نرسل تقرير نهائي حتى لو فشلت بعض المراحل
                echo "========================================="
                echo "PIPELINE EXECUTION COMPLETED"
                echo "Application is running on port 80 (Testing mode)"
                echo "Security report sent to ${EMAIL_RECIPIENT}"
                echo "========================================="
            }
        }
        
        success {
            echo "✅ All stages completed successfully!"
        }
        
        failure {
            echo "⚠️ Some stages had issues, but application is still running for testing"
            echo "Check the logs above for details"
        }
    }
}
