# basic-user-management
To Run database:
Docker-compose up

To apply Migrations:
dotnet tool install --global dotnet-ef
cd  UserManagement.DataAccess.EFCore/
dotnet ef --startup-project ../UserManagement.API/ database update