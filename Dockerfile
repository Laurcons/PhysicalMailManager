# Use the official PHP image with Apache
FROM php:7.4-apache

# Install necessary PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# Install Git
RUN apt-get update && apt-get install -y git

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Create necessary directories and copy application source code to the container
COPY app /var/www/html/app
COPY frontend /var/www/html/frontend
COPY public /var/www/html/public
COPY routes /var/www/html/routes
COPY composer* /var/www/html/
COPY .htaccess /var/www/html/

# Set the working directory
WORKDIR /var/www/html/

# Run Composer install
RUN composer install --no-dev --optimize-autoloader

# Expose port 80
EXPOSE 80

# Start Apache server
CMD ["apache2-foreground"]