const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AdsSidebarSchema = new mongoose.Schema({
  categories_id: {
    type: Schema.Types.ObjectId,
    ref: "categories",
  },
  large_banner:{
    type: String
  },
  small_banner:{
    type: String
  },
  large_banner_url:{
    type: String
  },
  small_banner_url:{
    type: String
  },
  section:[
    {
        section_title : {
            type: String
        },
        section_link:[
            {
                section_title : {
                    type: String
                }, 
                image_to_use: {
                    type : String
                }, 
                url:{
                    type : String
                },
                content_type : {
                    type : Number, // 0 for title link // 1 for button 
                    default : 0
                }
            }
        ]
    }
  ],
  deleted: {
    type: Boolean,
    default : false
  }
});

module.exports = AdsSidebar = mongoose.model("ads_sidebar", AdsSidebarSchema);
