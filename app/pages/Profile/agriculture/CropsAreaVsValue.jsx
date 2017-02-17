import React, {Component} from "react";
import {connect} from "react-redux";

import {Plot} from "d3plus-react";
import pluralize from "pluralize";

import {fetchData} from "actions/profile";
import {VARIABLES, FORMATTERS} from "helpers/formatters";
import {SectionColumns} from "datawheel-canon";

class CropsAreaVsValue extends Component {

  render() {

    const {data, profile} = this.props;
    let crops = data.slice();
    crops = crops.filter(c => c.harvested_area && c.harvested_area > 0);
    crops.forEach(c => {
      c.name = c.crop_name ? pluralize.plural(c.crop_name) : c.crop;
      c.density = c.value_of_production / c.harvested_area;
    });
    crops.sort((a, b) => b.density - a.density);
    const topCrop = crops[0];
    const bottomCrop = crops[crops.length - 1];

    return (
      <SectionColumns title="Harvested Area Versus Value of Production">
      <article>
        <p><strong>{ topCrop.name }</strong> are the crop with the highest production value per area in { profile.name }, with a harvested area of { VARIABLES.value_density(topCrop.density) }.</p>
        <p><strong>{ bottomCrop.name }</strong> are the crop with the lowest production value per area in { profile.name }, with a harvested area of { VARIABLES.value_density(bottomCrop.density) }.</p>
        <p>This means that growers of {topCrop.name} will earn approximately <strong>{FORMATTERS.round(topCrop.density / bottomCrop.density)} times</strong> more per hectacre of {topCrop.name} that they grow versus {bottomCrop.name}.</p>
      </article>
        <Plot config={{
          data: crops,
          label: d => d.name,
          legend: false,
          groupBy: "crop",
          x: "harvested_area",
          xConfig: {
            tickFormat: VARIABLES.harvested_area,
            title: "Harvested Area"
          },
          y: "value_of_production",
          yConfig: {
            tickFormat: VARIABLES.value_of_production,
            title: "Value of Production"
          }
        }} />
      </SectionColumns>
    );
  }
}

CropsAreaVsValue.need = [
  fetchData("harvested_area", "api/join/?geo=<id>&show=crop&required=harvested_area,value_of_production&order=harvested_area&sort=desc&display_names=true")
];

export default connect(state => ({
  data: state.profile.data.harvested_area
}), {})(CropsAreaVsValue);
