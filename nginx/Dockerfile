FROM debian:bookworm

# Install Nginx and ModSecurity-related packages
RUN apt-get update && apt-get install -y \
    nginx \
    libnginx-mod-http-modsecurity \
    libmodsecurity3 \
    libmodsecurity-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/coreruleset/coreruleset /opt/crs

COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY modsecurity/modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY modsecurity/modsec-api.conf /etc/nginx/modsec/modsec-api.conf
COPY modsecurity/crs-setup.conf /opt/crs/crs-setup.conf

# Certs will be mounted at runtime via docker-compose volume
COPY wait-for-certs.sh /wait-for-certs.sh
RUN chmod +x /wait-for-certs.sh

# Expose HTTP/S port
EXPOSE 80 443

# Start Nginx only after certs are present
CMD ["/wait-for-certs.sh"]
