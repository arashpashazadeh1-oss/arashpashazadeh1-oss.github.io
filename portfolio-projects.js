window.PORTFOLIO_PROJECTS = [
  {
    id:"portfolio-powerhouse-precast-beam", kind:"engineering", category:"Structural Engineering", status:"Completed", year:2024,
    title:"Powerhouse Precast Concrete Beam — Structural Design & Assessment",
    summary:"Conversion of a powerhouse beam system from cast-in-place to precast construction, including temporary-stage behavior, reinforcement, deflection/precamber, corbels, lifting anchors, and connection detailing.",
    methods:"Reinforced Concrete, ACI 318, Precast Design, Construction-Stage Analysis, AutoCAD, Structural Calculations",
    image_url:"assets/projects/powerhouse/drawing-1.jpg",
    role:"Structural and Hydraulic Structural Design Engineer", organization:"TGEM", location:"Sebzor Hydropower Plant · Tajikistan",
    overview:"The project assessed and developed a precast reinforced-concrete beam solution for the powerhouse. The key engineering issue was that the beam had to be safe not only in its final integrated condition, but also during lifting, placement on corbels, and the temporary construction stage before connection to the surrounding structure.",
    highlights:["Approx. beam length: 12.2 m","Typical section: 500 × 600 mm","Temporary-stage moment Mhh ≈ 195.35 kN·m","Final fixed-end moment Mff ≈ 95.2 kN·m","20 mm precamber assessed","Additional bottom reinforcement: 4Ø25","Beam self-weight ≈ 9,150 kg"],
    sections:[
      ["01","Structural Adequacy Assessment","Evaluation of the proposed precast beam under structural load combinations, including self-weight, floor actions, soil pressure, wind, earthquake and crane-related actions. Cracking moments about the principal axes were checked to support the stiffness assumptions used in analysis."],
      ["02","Construction-Stage Structural Analysis","The installation stage and final structural stage were evaluated separately. During placement, the beam behaves approximately as a simply supported member on corbels; after integration with the surrounding concrete, the final system develops fixed-end behavior. This distinction governed part of the reinforcement design."],
      ["03","Deflection & Precamber Assessment","Temporary-stage deformation was assessed against the final fixed-end condition and construction clearances. A 20 mm precamber was evaluated to control installation-stage deflection and maintain compatibility with surrounding powerhouse components."],
      ["04","Flexural Reinforcement Design","Additional longitudinal reinforcement was designed for construction-stage demand using reinforced-concrete design provisions. The developed solution included 4Ø25 bottom longitudinal bars in the critical region."],
      ["05","Corbel Design","Corbels supporting the precast beams during installation were checked for vertical reaction, reinforcement demand, geometry, constructability and clearance constraints. Existing powerhouse corbel details were reviewed for adaptation."],
      ["06","Lifting Anchor Design","A lifting arrangement was developed for transportation and placement of the precast member. The design considered amplified lifting demand, unequal load distribution and a four-anchor arrangement."],
      ["07","Beam Connections & Design Revisions","Beam-to-wall and beam-to-longitudinal-beam details were developed for shear transfer, anchorage, dowels, lap lengths and construction interfaces. The calculation and drawing package was revised through formal engineering review comments."],
    ],
    gallery:[
      ["assets/projects/powerhouse/drawing-1.jpg","Powerhouse beam general arrangement"],
      ["assets/projects/powerhouse/drawing-3.jpg","Precast beam design drawing"],
      ["assets/projects/powerhouse/drawing-5.jpg","Reinforcement and structural detailing"],
      ["assets/projects/powerhouse/drawing-7.jpg","Detailed construction drawing"],
      ["assets/projects/powerhouse/corbel.jpg","Corbel reinforcement detail"],
      ["assets/projects/powerhouse/connection.jpg","Beam-to-wall connection detail"],
      ["assets/projects/powerhouse/drawing-10.jpg","Final drawing package detail"]
    ]
  },
  {
    id:"portfolio-existing-bridge-relocation", kind:"engineering", category:"Bridge / Survey & Site Engineering", status:"Completed", year:2024,
    title:"Existing Bridge Relocation — Survey, Terrain & Site Modeling",
    summary:"Processing and integration of field survey coordinates, CAD/DXF geometry, and geospatial terrain information to support evaluation of an existing bridge at a proposed new location.",
    methods:"AutoCAD, DXF/DWG, Global Mapper, Survey Processing, Terrain Modeling, GIS",
    image_url:"assets/projects/bridge/survey-elevation.png",
    overview:"This project organized and integrated field-survey, CAD and geospatial data for the proposed relocation of an existing bridge. The available package contains survey coordinate sets, DWG/DXF geometry and a Global Mapper workspace; the portfolio description is intentionally limited to work evidenced by those source files.",
    highlights:["604 parsed survey points in the supplied point sets","Coordinate-based 3D terrain data","DWG and DXF engineering geometry","Global Mapper workspace","Elevation range in parsed datasets: 2468.799–2502.369 m"],
    sections:[
      ["01","Survey Point Processing","Field survey datasets containing point identifiers, Easting, Northing and Elevation values were compiled and checked to establish the geometric basis of the site model."],
      ["02","CAD Geometry Development","Survey information was represented in DWG/DXF-compatible engineering geometry, allowing coordinate-based site information to be used in the CAD workflow."],
      ["03","Terrain & Geospatial Modeling","The project workspace combined survey points, elevation information and CAD geometry with Global Mapper for broader terrain and site-context visualization."],
      ["04","Bridge Location Assessment","The integrated data provides the geometric basis for evaluating the existing bridge relative to the proposed site, terrain elevations and alignment. No structural calculations are claimed because none were present in the supplied archive."],
    ],
    gallery:[
      ["assets/projects/bridge/survey-elevation.png","Surveyed site points colored by elevation"],
      ["assets/projects/bridge/elevation-profile.png","Elevation profile derived from supplied survey points"]
    ]
  }
];
