from app.main import app
count = 0
for r in app.routes:
    p = getattr(r, "path", "")
    if "integrations" in p:
        print(sorted(getattr(r, "methods", ["?"])), p)
        count += 1
print("total:", count)
