import re

with open('/Users/sai2005/Downloads/gitprojects/mithra_web.ai/client-app/client/src/pages/LandingPage.jsx', 'r') as f:
    content = f.read()

# Fix 1: Remove animate-pulse-slow and pulse animation from huge background blurs
content = re.sub(r'animate-pulse-slow', '', content)
content = content.replace("style={{ animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse' }}", "")

# Fix 2: Optimize blur elements on hover. Instead of changing bg color which forces re-rasterization,
# we will use opacity.
# Example: bg-purple-500/10 ... group-hover:bg-purple-500/20 
# -> bg-purple-500/20 opacity-50 ... group-hover:opacity-100
colors = ['purple', 'blue', 'orange', 'cyan', 'green', 'pink']
for c in colors:
    target = f'bg-{c}-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-{c}-500/20 transition-all duration-500'
    replacement = f'bg-{c}-500/20 opacity-50 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity duration-500'
    content = content.replace(target, replacement)

# Fix 3: Reduce the blur radius on the massive background elements from 150px to 100px to save performance
# blur-[150px] -> blur-[100px]
content = content.replace('blur-[150px]', 'blur-[100px]')

with open('/Users/sai2005/Downloads/gitprojects/mithra_web.ai/client-app/client/src/pages/LandingPage.jsx', 'w') as f:
    f.write(content)
print("Optimizations applied")
