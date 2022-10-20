import React from "react";
import { Text } from "rebass";
import styled, { useTheme } from "styled-components";
import { useCurrency } from "../../hooks/Tokens";
import { formattedNum } from "../../utils/formatBalance";
import CurrencyLogo from "../CurrencyLogo";

interface TokenRowProps {
    token: any;
    previousToken: any;
    index: number
  }

const Row = styled.tr`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.opacitySmall};
    :last-child {
        border-bottom: none;
    }
`;

const TableData = styled.td`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18%;
`

const Arrow = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 19V5" stroke={props.stroke} stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 12L12 5L19 12" stroke={props.stroke} stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
)

export const TopTokensRow: React.FC<TokenRowProps> = (item) => {
    const {token, previousToken, index} = item;
    const currency = useCurrency(token.token.id)
    const theme = useTheme();
    const changePercent = (((parseFloat(token.priceUSD) - parseFloat(previousToken.priceUSD)) / parseFloat(previousToken.priceUSD)) * 100).toFixed(2);
    return (
    <Row>
    <TableData>
        <Text
        style={{ width: "100px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"15px"}
        >
        {index + 1}
        </Text>
    </TableData>
    <TableData>
        <CurrencyLogo
        style={{ width: "30px", height: "30px", marginRight: "10px" }}
        currency={currency}
        />
        <Text
        style={{ width: "100px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"15px"}
        >
        {token.token.symbol}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ width: "100px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"15px"}
        >
        {formattedNum(parseFloat(token.priceUSD).toFixed(5), true)}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ width: "100px", alignSelf: "center", display: 'flex' }}
        color={parseFloat(changePercent) >= 0 ? '#479E34' : '#BC2929'}
        fontSize={"15px"}
        >
        <div style={{rotate:parseFloat(changePercent) >= 0 ? '0deg' : '180deg', height: '24px', width: '24px'}}>
            <Arrow stroke={parseFloat(changePercent) >= 0 ? '#479E34' : '#BC2929'} />
        </div>
        {changePercent}%
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ width: "100px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"15px"}
        >
        {formattedNum(parseFloat(token.dailyVolumeUSD).toFixed(2), true)}
        </Text>
    </TableData>
    <TableData>
        <Text
        style={{ width: "100px", alignSelf: "center" }}
        color={theme.whiteHalf}
        fontSize={"15px"}
        >
        {formattedNum(parseFloat(token.totalLiquidityUSD).toFixed(2), true)}
        </Text>
    </TableData>
    </Row>
);}
