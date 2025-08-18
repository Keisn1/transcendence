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

# Copy and rename the setup file
RUN cp /opt/crs/crs-setup.conf.example /opt/crs/crs-setup.conf

# Convert all example rule files to real .conf files
RUN mkdir -p /opt/crs/rules && \
    for f in /opt/crs/rules/*.example; do \
      cp "$f" "${f%.example}"; \
    done

# -----------------------------
# Copy Nginx config and ModSecurity rules
# -----------------------------
COPY conf/nginx.conf /etc/nginx/nginx.conf
COPY modsecurity/modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY modsecurity/modsec-api.conf /etc/nginx/modsec/modsec-api.conf

# Certs will be mounted at runtime via docker-compose volume
COPY wait-for-certs.sh /wait-for-certs.sh
RUN chmod +x /wait-for-certs.sh

# Expose HTTP/S port
EXPOSE 80 443

# Start Nginx only after certs are present
CMD ["/wait-for-certs.sh"]
