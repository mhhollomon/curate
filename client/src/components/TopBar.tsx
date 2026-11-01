import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Flex } from "@radix-ui/themes/components/flex";
import { Box } from "@radix-ui/themes/components/box";

export default function Topbar() {

    return (<Flex justify="between" mb="3" style={{backgroundColor : "var(--accent-10)", color : "white"}}>
        <Box display="inline-block" ml="1">
            <HamburgerMenuIcon />
        </Box>
        <Box display="inline-block">Curate</Box>
        <Box display="inline-block" mr="1">&nbsp;</Box>
    </Flex>)
}
