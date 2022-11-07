from urllib.request import urlopen
url = "https://www.ims.tau.ac.il/Bidd/Stats/Stats_P.aspx"
page = urlopen(url)
print(page)

html_bytes = page.read()
html = html_bytes.decode("utf-8")
print(html)