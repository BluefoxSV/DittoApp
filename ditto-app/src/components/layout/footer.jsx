import footerData from "./data/footerData";
import socialLinks from "./data/socialLinks";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#041021",
        color: "rgba(255,255,255,0.75)",
        textAlign: {
          xs: "center",
          lg: "left",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: {
            xs: "center",
            lg: "space-between",
          },
          flexDirection: {
            xs: "column",
            lg: "row",
          },
          gap: 2,
          px: {
            xs: 3,
            md: 6,
          },
          py: 3,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            display: {
              xs: "none",
              lg: "block",
            },
            color: "rgba(255,255,255,0.75)",
          }}
        >
          Síguenos en nuestras redes sociales:
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 3,
          }}
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;

            return (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                title={social.name}
                sx={{
                  color: "rgba(255,255,255,0.75)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "0.2s ease",
                  "&:hover": {
                    color: "#fff",
                    opacity: 0.8,
                  },
                  "& svg": {
                    width: 18,
                    height: 18,
                  },
                }}
              >
                <Icon />
              </Link>
            );
          })}
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Box
          sx={{
            py: 6,
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} lg={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: {
                    xs: "center",
                    md: "flex-start",
                  },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "#fff",
                    "& svg": {
                      width: 20,
                      height: 20,
                    },
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
                  </svg>
                </Box>

                <Typography
                  variant="subtitle1"
                  component="h6"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#fff",
                  }}
                >
                  Ditto App
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Potencia tu negocio con nuestras soluciones de software
                empresarial diseñadas para la era digital, con IA integrada y
                tecnología de vanguardia.
              </Typography>
            </Grid>

            {footerData.map((section, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Typography
                  variant="subtitle1"
                  component="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#fff",
                  }}
                >
                  {section.title}
                </Typography>

                {section.items.map((item, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{
                      mb: 1.5,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {item.link ? (
                      <Link
                        href={item.link}
                        underline="hover"
                        sx={{
                          color: "rgba(255,255,255,0.7)",
                          transition: "0.2s ease",
                          "&:hover": {
                            color: "#fff",
                          },
                        }}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <Box component="span">{item.label}</Box>
                    )}
                  </Typography>
                ))}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Box
        sx={{
          bgcolor: "rgba(0,0,0,0.2)",
          px: 3,
          py: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.75)",
          }}
        >
          © 2023 Copyright:{" "}
          <Link
            href="https://bluefoxsv.com/"
            target="_blank"
            rel="noreferrer"
            underline="hover"
            sx={{
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Ditto App
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}