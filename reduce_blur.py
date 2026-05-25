import re

with open('/Users/sai2005/Downloads/gitprojects/mithra_web.ai/client-app/client/src/pages/LandingPage.jsx', 'r') as f:
    content = f.read()

# Reduce heavy backdrop blurs to md to save performance
content = content.replace('backdrop-blur-3xl', 'backdrop-blur-lg')
content = content.replace('backdrop-blur-2xl', 'backdrop-blur-lg')
content = content.replace('backdrop-blur-xl', 'backdrop-blur-md')

with open('/Users/sai2005/Downloads/gitprojects/mithra_web.ai/client-app/client/src/pages/LandingPage.jsx', 'w') as f:
    f.write(content)
print("Backdrop blurs reduced")
