
import React from "react";
import { Field } from "formik";
import styles from "@/app/pre-intake/preIntake.module.css";

const FirstNationSelect = ({name, label, error }) => {
    return(
        <>
            <label htmlFor="province">{label}:</label>
            <Field as="select" name={name} className={styles.select}>
                <option value="">Select a first nation</option>
                <option value="barren_lands">Barren Lands First Nation (Brochet)</option>
                <option value="berens_river">Berens River First Nation</option>
                <option value="birdtail_sioux">Birdtail Sioux Dakota Nation</option>
                <option value="black_river">Black River First Nation</option>
                <option value="bloodvein">Bloodvein First Nation</option>
                <option value="brokenhead">Brokenhead Ojibway Nation</option>
                <option value="buffalo_point">Buffalo Point First Nation</option>
                <option value="bunibonibee">Bunibonibee Cree Nation</option>
                <option value="canupawakpa">Canupawakpa Dakota Nation</option>
                <option value="chemawawin">Chemawawin Cree Nation</option>
                <option value="cross_lake">Cross Lake (Pimicikamak) First Nation</option>
                <option value="dakota_plains">Dakota Plains Wahpeton Nation</option>
                <option value="dakota_tipi">Dakota Tipi First Nation</option>
                <option value="dauphin_river">Dauphin River First Nation</option>
                <option value="ebb_and_flow">Ebb and Flow First Nation</option>
                <option value="fisher_river">Fisher River Cree Nation</option>
                <option value="fox_lake">Fox Lake Cree Nation</option>
                <option value="gamblers">Gambler's First Nation</option>
                <option value="garden_hill">Garden Hill First Nation</option>
                <option value="gods_lake">God's Lake First Nation</option>
                <option value="hollow_water">Hollow Water First Nation</option>
                <option value="keeseekoowenin">Keeseekoowenin Ojibway Nation</option>
                <option value="kinonjeoshtegon">Kinonjeoshtegon First Nation (Jackhead)</option>
                <option value="lake_manitoba">Lake Manitoba Treaty 2 First Nation (Dog Creek)</option>
                <option value="lake_st_martin">Lake St. Martin First Nation</option>
                <option value="little_grand_rapids">Little Grand Rapids First Nation</option>
                <option value="little_saskatchewan">Little Saskatchewan First Nation</option>
                <option value="long_plain">Long Plain First Nation</option>
                <option value="manto_sipi">Manto Sipi Cree Nation (God's River)</option>
                <option value="marcel_colomb">Marcel Colomb First Nation (Black Sturgeon)</option>
                <option value="misipawistik">Misipawistik Cree Nation (Grand Rapids)</option>
                <option value="mosakahiken">Mosakahiken Cree Nation (Moose Lake)</option>
                <option value="nisichawayasihk">Nisichawayasihk Cree Nation (Nelson House)</option>
                <option value="northlands_denesuline">Northlands Denesuline First Nation (Lac Brochet)</option>
                <option value="norway_house">Norway House Cree Nation</option>
                <option value="o_chi_chak_ko_sipi">O-Chi-Chak-Ko-Sipi First Nation (Crane River)</option>
                <option value="opaskwayak">Opaskwayak Cree Nation</option>
                <option value="o_pipon_na_piwin">O-Pipon-Na-Piwin Cree Nation (South Indian Lake)</option>
                <option value="pauingassi">Pauingassi First Nation</option>
                <option value="peguis">Peguis First Nation</option>
                <option value="pinaymootang">Pinaymootang First Nation (Fairford)</option>
                <option value="pine_creek">Pine Creek First Nation</option>
                <option value="poplar_river">Poplar River First Nation</option>
                <option value="pukatawagan">Pukatawagan Cree Nation (Mathias Colomb)</option>
                <option value="red_sucker_lake">Red Sucker Lake First Nation</option>
                <option value="rolling_river">Rolling River First Nation</option>
                <option value="roseau_river">Roseau River Anishinabe First Nation</option>
                <option value="sagkeeng">Sagkeeng First Nation</option>
                <option value="sandy_bay">Sandy Bay First Nation</option>
                <option value="sapotaweyak">Sapotaweyak Cree Nation (Pelican Rapids)</option>
                <option value="sayisi_dene">Sayisi Dene First Nation (Tadoule Lake)</option>
                <option value="shamattawa">Shamattawa First Nation</option>
                <option value="sioux_valley">Sioux Valley First Nation</option>
                <option value="skownan">Skownan First Nation</option>
                <option value="st_theresa_point">St. Theresa Point First Nation</option>
                <option value="swan_lake">Swan Lake First Nation</option>
                <option value="tataskweyak">Tataskweyak Cree Nation</option>
                <option value="tootinaowaziibeeng">Tootinaowaziibeeng Treaty Reserve (Valley River)</option>
                <option value="war_lake">War Lake First Nation</option>
                <option value="wasagamack">Wasagamack First Nation</option>
                <option value="waywayseecappo">Waywayseecappo First Nation</option>
                <option value="wuskwi_sipihk">Wuskwi Sipihk First Nation (Swampy Cree)</option>
                <option value="york_factory">York Factory First Nation</option>
                <option value="non_status">Non-Status</option>
                <option value="metis">Metis</option>
                <option value="na">N/A</option>
                <option value="other">Other</option>
            </Field>
        </>
    );
}

export default FirstNationSelect;

