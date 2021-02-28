<!--//

title: How to backup your MySQL database(s) to S3 using the AWS CLI
date: 2016-11-22
image: backup-mysql-to-aws-hero.webp
live: true

//-->

# How to Backup Your MySQL Database(s) to S3 Using the AWS CLI

![MySql and AWS backup](assets/images/backup-mysql-to-aws-hero.webp)

<!-- snippet -->It is good practice to create systematic backups of your databases and store them in a location separate from your server. Using MySQL and Amazon S3 we can set this up effortlessly. We will be preparing the commands needed to create the backup, send it to your S3 bucket using the AWS CLI, and finally setting up a cron job to do a daily backup.

_This guide was created using MySQL version 5.7 and AWS CLI version 1.11._

## Backing Up the Databases

Let's start with the command that safely backs up all of your MySQL databases:

```bash
mysqldump -u<user> -p \
          --single-transaction \
          --routines \
          --all-databases > database_backup_$(date +\%Y\%m\%d\%H\%M).sql
```

_Replace `<user>` with the user you'd like to use for the dump._

* [`--single-transaction`](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_single-transaction)

    This flag initiates a transaction so active reads and writes will not be blocked. This is a mandatory flag for any `mysqldump` on a live database.
* [`--routines`](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_routines)

    This flag will include stored routines. Note the timestamp attributes will change since the routines will be recreated. Making a dump of the `mysql.proc` table is the accepted method if you need to preserve the timestamps.
* [`--all-databases`](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_all-databases)

    This flag is pretty self-explanatory. It will dump of all available databases the user has access to.

**Note:** Using `$(date +\%Y\%m\%d\%H\%M)` simply concatenates a timestamp to the file name. This serves the dual purpose of documenting the date of the backup and creating a unique file name that cannot be overwritten (unless the the clock gets set back on the server).

## Compressing the Database Backup

Let's save some space on these backups by compressing them using [gzip](http://www.gzip.org/):

```bash
mysqldump -u<user> -p \
          --single-transaction \
          --routines \
          --all-databases | \
gzip > database_backup_$(date +\%Y\%m\%d\%H\%M).sql.gz
```

## Uploading Compressed Database Backup to Amazon S3

In order to use the AWS CLI you will need to [install](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) it and [configure](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) it with an IAM access key and secret. You will also need to create a bucket in S3 to store the backups. I created a bucket called `database-backups` to upload mine to. We can pipe our gzipped dump straight into S3 without creating any files on our server:

```bash
mysqldump -u<user> -p \
          --single-transaction \
          --routines \
          --all-databases | \
gzip | \
aws s3 cp - s3://database-backups/database_backup_$(date +\%Y\%m\%d\%H\%M).sql.gz
```

If you'd like to create a copy on the server as well, you can use this command:

```bash
DATE=$(date +\%Y\%m\%d\%H\%M) && \
mysqldump -u<user> -p \
          --single-transaction \
          --routines \
          --all-databases | \
gzip > database_backup_$DATE.sql.gz && \
aws s3 cp database_backup_$DATE.sql.gz s3://database-backups/
```

## Finally, Cron Job for Daily Backup

Cron jobs tend to like absolute paths to executables so let's find the path to our AWS CLI:

```bash
which aws
```

Create a file named `.my.cnf` in your `~/` directory. The file should look like this:

```
[client]
user=root
password=<password>
```

Open your user specific crontab:

```bash
crontab -u $(whoami) -e
```

At the end of the file, add a cron job that runs once per day (need to escape % for cron to work):

```bash
0 0 * * * mysqldump --single-transaction --routines --all-databases | gzip | aws s3 cp - s3://database-backups/database_backup_$(date +\%Y\%m\%d\%H\%M).sql.gz
```

## Conclusion

You should now have a daily cron job running that creates a compressed backup of all your MySQL databases and sends them to an S3 bucket. Next steps might include rotating out older backups in the S3 bucket, either by deleting them after a certain amount of time, or moving them to [Amazon Glacier](https://aws.amazon.com/glacier/).
