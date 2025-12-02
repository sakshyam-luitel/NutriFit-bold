import pymysql

# This allows Django to use PyMySQL as a drop-in replacement for mysqlclient
pymysql.install_as_MySQLdb()
