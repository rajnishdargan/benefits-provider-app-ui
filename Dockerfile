FROM nginx:latest
WORKDIR /usr/share/nginx/html/
#RUN mkdir -p uba-ui
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
