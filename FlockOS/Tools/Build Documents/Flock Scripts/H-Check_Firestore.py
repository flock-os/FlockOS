import firebase_admin
from firebase_admin import firestore

firebase_admin.initialize_app(options={'projectId': 'flockos-notify'})
db = firestore.client()

key_collections = ['members', 'careCases', 'careAssignments', 'careInteractions', 'problems', 'quarterlyPlans', 'journal', 'permissions']
print('Key collection counts:')
for name in key_collections:
    docs = list(db.collection(name).get())
    print(f'  {name}: {len(docs)} docs')

