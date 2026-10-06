# Set DOTNET_VERSION to the major version you installed locally (`dotnet --version`), e.g. 8.0 or 9.0
ARG DOTNET_VERSION=10.0

FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION}-alpine AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION}-alpine
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
# Assembly name is Identidad because the project is created with `dotnet new webapi -n Identidad`
ENTRYPOINT ["dotnet", "Identidad.dll"]
