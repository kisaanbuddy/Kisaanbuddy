with open('frontend-next/src/components/Header.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("pathname !== '/login'", "(pathname as string) !== '/login'")

with open('frontend-next/src/components/Header.tsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(text)

print("Fixed Header.tsx typing")
