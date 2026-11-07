with open('backend/db/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = '        message = Column(Text, nullable=True)\n        status = Column(String(30), default="submitted", nullable=False, index=True)'
replacement = '''        message = Column(Text, nullable=True)
        inquiry_type = Column(String(50), default="quotation", nullable=True)  # quotation, callback, general_inquiry
        preferred_callback_time = Column(String(100), nullable=True)
        status = Column(String(30), default="submitted", nullable=False, index=True)'''

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/db/models.py', 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content)
    print('Successfully updated backend/db/models.py')
else:
    print('Target not found')
