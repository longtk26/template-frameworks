package configs

type ServerConfig struct {
	Port string `mapstructure:"PORT"`
	Env  string `mapstructure:"ENV"`
}

type DatabaseConfig struct {
	Host     string `mapstructure:"DB_HOST"`
	Port     string `mapstructure:"DB_PORT"`
	User     string `mapstructure:"DB_USER"`
	Password string `mapstructure:"DB_PASSWORD"`
	Name     string `mapstructure:"DB_NAME"`
}

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
}
