    // 检测密码强度
    document.addEventListener('DOMContentLoaded', function () {
        var passwordInput = document.querySelector('.passwordKeyUp_PC');
        if (passwordInput) {
            passwordInput.addEventListener('keyup', function () {
                var password = this.value;
                var strengthBar = document.getElementById('strength-bar-inner');
                var strengthText = document.getElementById('strength-text');
    
                var hasLower = /[a-z]/.test(password);
                var hasUpper = /[A-Z]/.test(password);
                var hasNumber = /\d/.test(password);
                var hasSpecial = /[@$!%*?&#]/.test(password);
                var countSpecial = (password.match(/[@$!%*?&#]/g) || []).length;
    
                if (password.length === 0) {
                    strengthBar.style.width = '0%';
                    strengthText.textContent = '请输入密码';
                    strengthText.style.color = '#333';
                } else if (hasLower && hasUpper && hasNumber && hasSpecial && countSpecial >= 2) {
                    strengthBar.style.width = '100%';
                    strengthBar.style.backgroundColor = 'green';
                    strengthText.textContent = '密码强度: 强';
                    strengthText.style.color = 'green';
                } else if (hasLower && hasUpper && hasNumber && hasSpecial && countSpecial >= 1) {
                    strengthBar.style.width = '50%';
                    strengthBar.style.backgroundColor = 'orange';
                    strengthText.textContent = '密码强度: 中';
                    strengthText.style.color = 'orange';
                } else {
                    strengthBar.style.width = '25%';
                    strengthBar.style.backgroundColor = 'red';
                    strengthText.textContent = '密码强度: 弱';
                    strengthText.style.color = 'red';
                }
            });
        }
    });
    
    