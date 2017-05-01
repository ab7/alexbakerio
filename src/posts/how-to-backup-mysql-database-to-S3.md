<!--//

title: How to backup your MySQL database(s) to S3 using the AWS CLI
date: 2016-11-22
image: mysql-s3-hero.png
live: true

//-->

# How to backup your MySQL database(s) to S3 using the AWS CLI

<!-- snippet -->In order to keep the server stateless it's a good idea to store your backups in a separate location. This can be setup effortlessly with a cron job and the AWS CLI.

Let's start with the command that backs up all of your MySQL databases:

Then the command to compress the database dump to optimize backup space:

Finally, the command to upload a file to S3 using the AWS CLI:

Using pipes we can turn this into a one-liner:

```
mysqldump --opt --all-databases | gzip | aws s3 cp - s3://wordpress-server-db-backup/wordpress_db_backup_$(date +"%Y%m%d%H%M").sql.gz
```

Need to setup .my.cnf and set the cronjob for the user with the .my.cnf

```
crontab -u ubuntu -e
```

Figure out full path of aws executable:

```
which aws
```

Now let's put it together with a cron job that runs once per day (need to escape % for cron to work):

```
0 0 * * * mysqldump --opt --all-databases | gzip | /usr/local/bin/aws s3 cp - s3://wordpress-server-db-backup/wordpress_db_backup_$(date +\%Y\%m\%d\%H\%M).sql.gz
```
