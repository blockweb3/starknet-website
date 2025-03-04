import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  LinkBox,
  Stack,
} from "src/libs/chakra-ui";
import { ImageIconBox } from "./components/ImageIconBox";
import { Heading } from "@ui/Typography/Heading";
import { Text } from "@ui/Typography/Text";
import "./style.css";
import NextLink from "next/link";
import { CardGradientBorder } from "@ui/Card/components/CardGradientBorder";
import { getComputedLinkData } from "src/utils/utils";
import { CustomLink } from "@ui/Link/CustomLink";
import { LinkData } from "@starknet-io/cms-data/src/settings/main-menu";

type Props = {
  variant?: "image_icon_link_card" | "icon_link_card" | "dapp" | "large_card" | "community_card";
  title: string;
  link?: LinkData;
  icon?: string;
  description?: string;
  locale: string,
  size?: "large" | "small",
  withIllustration?: boolean,
  withBackground?: boolean,
  columns?: number,
  color?:
  | "blue-default"
  | "orange"
  | "blue"
  | "purple"
  | "peach"
  | "cyan"
  | "pink"
  | "grey",
  orientation?: "left" | "right"
};

type titleVariantType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type linkVariantType = "cardBody" | "breadcrumbs" | "footerLink" | "textLink";
type descriptionVariantType = "body" | "cardBody" | "breadcrumbs" | "footerLink" | "textLink";

export const ImageIconCard = ({
  title,
  description,
  link,
  icon,
  color = "orange",
  locale,
  size = "large",
  withIllustration = false,
  variant = "image_icon_link_card",
  columns = 4,
  orientation = "left"
}: Props) => {
  const { href, label } = getComputedLinkData(locale, link ?? {
      custom_title: 'dsa',
      custom_internal_link: 'asd'
  });
  let titleVariant;
  let descriptionVariant;
  let linkVariant;
  let cardFooterPadding;
  let globalPadding;
  switch (variant) {
    case "image_icon_link_card":
      titleVariant = size === "large" ? "h3" : "h4";
      descriptionVariant = size === "large" ? "body" : "cardBody";
      linkVariant = size === "large" ? "cardLink" : "smallCardLink";
      cardFooterPadding = "24px 0 0 0";
      break;
    case "icon_link_card":
      titleVariant = size === "large" ? "h3" : "h4";
      linkVariant = size === "large" ? "cardLink" : "smallCardLink";
      cardFooterPadding = "16px 0 0 0";
      globalPadding = columns === 4 ? "120px 40px 48px 32px" : "68px 48px 36px 48px";
      break;
    case "dapp":
      titleVariant = "h3";
      descriptionVariant = "body";
      cardFooterPadding = "24px 0 0 0";
      break;
    case "large_card":
      titleVariant = "h2";
      descriptionVariant = "body";
      cardFooterPadding = "24px 0 0 0";
      linkVariant = "cardLink";
      break;
    case "community_card":
      titleVariant = "h4";
      descriptionVariant = "body";
      cardFooterPadding = "0 0 0 40px";
      linkVariant = "mediumCardLink";
      break;
    default:
      cardFooterPadding = "24px 0 0 0";
      titleVariant = size === "large" ? "h3" : "h4";
      descriptionVariant = size === "large" ? "body" : "cardBody";
      linkVariant = size === "large" ? "cardLink" : "smallCardLink";
  }
  return (
    <LinkBox
      as={NextLink}
      href={href!}
      sx={{ textDecoration: "none!important" }}
    >
      <CardGradientBorder
        padding="0"
        borderRadius={{ base: "24px", md: variant === "community_card" ? "104px" : "24px" }}
      >
        <Card
          overflow="hidden"
          borderRadius={{ base: "24px", md: variant === "community_card" ? "104px" : "24px" }}
          boxShadow="none"
          bg="card-bg"
          flexDirection={
            { base: "column", md: (orientation === "right" && variant === "large_card") ? "row-reverse" : 
            (orientation === "left" && variant === "large_card") ? "row" :
            variant === "community_card" ? "row" : "column"
          }}
          padding={variant === "community_card" ? "16px" : variant === "large_card" ? "48px" : "0"}
          {...(orientation === "right" && variant === "large_card" && { justifyContent: "space-between" })}
          alignItems={{ lg: variant === "large_card" ? "center" : "initial" }}
          height="100%"
        >
          <ImageIconBox title={title} variant={variant} color={color} size={size} icon={variant === "community_card" ? "/assets/cards/user-group.svg" : icon} withIllustration={withIllustration} />
          <Box
            padding={{
              base: variant === "community_card" ? "24px 32px 0 0" : (size === "large" && icon && variant === "image_icon_link_card") ?
                "48px 32px 48px 32px" :
                variant === "large_card" ?
                "32px 0 0 0" :
                (variant === "icon_link_card" && !icon) ?
                  globalPadding :
                  variant === "dapp" ?
                    "40px 32px 48px 32px" :
                    "32px 32px 40px 32px",
              md: variant === "community_card" ? "24px 32px 24px 40px" : (size === "large" && icon && variant === "image_icon_link_card") ?
              "48px 32px 48px 32px" :
              (orientation === "right" && variant === "large_card") ?
                "1px 80px 0 0" :
                (orientation === "left" && variant === "large_card") ?
                "2px 0 0 80px" :
                (variant === "icon_link_card" && !icon) ?
                  globalPadding :
                  variant === "dapp" ?
                    "40px 32px 48px 32px" :
                    "32px 32px 40px 32px"
            }}
            {...(variant === "large_card" && { justifyContent: "center", display: "flex", flexDirection: "column" })}
            borderLeft={variant === "community_card" ? {base: "none", md: "1px solid #EFEFEF"} : "none"}
            marginLeft={variant === "community_card" ? {base: "0", md: "44px"} : "0"}
          >
            <CardBody
              padding="0"
              {...(variant === "large_card" && { flex: "inherit" })}
            >
              <Stack spacing="3">
                <Heading variant={titleVariant as titleVariantType} lineHeight="100%" {...(variant === "large_card" && { paddingBottom: "8px" })}>
                  {title}
                </Heading>
                {variant !== "icon_link_card" && <Text variant={descriptionVariant as descriptionVariantType} paddingTop="0px" color="grey.coolerText" _dark={{color: "grey.morning"}} lineHeight="24px">{description} {variant === "community_card" && <CustomLink
                  variant={linkVariant as linkVariantType}
                  color="selected.main"
                  href={href}
                  _hover={{ textDecoration: "underline!important" }}
                >
                  {label} &rarr;
                </CustomLink>}</Text>}
              </Stack>
            </CardBody>

            {link && variant !== "dapp" && variant !== "community_card" && <CardFooter padding={cardFooterPadding}>
              <ButtonGroup spacing="2">
                <CustomLink
                  variant={linkVariant as linkVariantType}
                  color="selected.main"
                  href={href}
                  _hover={{ textDecoration: "underline!important" }}
                >
                  {label} &rarr;
                </CustomLink>
              </ButtonGroup>
            </CardFooter>}
          </Box>
        </Card>
      </CardGradientBorder>
    </LinkBox>
  );
};
