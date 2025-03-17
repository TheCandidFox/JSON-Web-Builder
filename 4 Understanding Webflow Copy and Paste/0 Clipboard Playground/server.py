import http.server
import ssl

server_address = ('127.0.0.1', 8000)
handler = http.server.SimpleHTTPRequestHandler

httpd = http.server.HTTPServer(server_address, handler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile="cert.pem", keyfile="key.pem", server_side=True)

print("Serving on https://127.0.0.1:8000")
httpd.serve_forever()
