import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app

# handler pour Vercel
def handler(event, context):
    return app(event, context)
