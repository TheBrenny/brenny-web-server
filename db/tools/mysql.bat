:: THIS SCRIPT STARTS A DOCKER CONTAINER WITH MYSQL
:: Probably not what you want?

docker start mysql || docker run --name mysql --ip 127.10.1.1 -p 3306:3306 -v "%~dp0/../mysql":/var/lib/mysql -e MYSQL_USER=user -e MYSQL_PASSWORD=pass -e MYSQL_DATABASE=db -e MYSQL_ROOT_PASSWORD=pass -d mysql
@IF NOT %1.==. GOTO :END
@echo Waiting for container to start. Press any key to skip waiting.
@timeout 15
@echo Done!

:END
exit /B %errorlevel%