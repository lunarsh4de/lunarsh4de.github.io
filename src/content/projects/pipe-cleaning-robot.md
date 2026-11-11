## Starting with the pipe-cleaning workflow

Cleaning urban drainage pipes typically involves locating a blockage, clearing sediment manually or with small machines, rinsing with high-pressure water and inspecting the result. Restricted access and poor visibility make inspection and maintenance difficult.

This concept connects inspection, cleaning, rinsing and follow-up checks in a device operated by personnel above ground.

![Research into manual and mechanically assisted drain cleaning](/images/projects/pipe-cleaning-robot/traditional-cleaning.webp)
![Locating a blockage with a camera probe](/images/projects/pipe-cleaning-robot/locating.webp)
![Research into cleaning with small mechanical equipment](/images/projects/pipe-cleaning-robot/assisted-cleaning.webp)
![Inspecting the pipe after cleaning](/images/projects/pipe-cleaning-robot/inspection.webp)

### Proposed workflow

1. Start the device and enter the pipe.
2. Observe the interior through the sensing module and locate the blockage.
3. Clean the pipe walls with the front blades and rinse with high-pressure nozzles.
4. Inspect the result and return the device for checks and maintenance.

## A compact body and modular cleaning assembly

Early sketches combine the body, sensing module, cleaning head and four-wheel chassis into a compact architecture. Front blades provide mechanical cleaning, while rear nozzles address rinsing. Interchangeable heads and stepped height adjustment explore adaptation to different pipe diameters.

![Sketches of body proportions, wheel layout and cleaning heads](/images/projects/pipe-cleaning-robot/sketches.webp)

![Stepped chassis height and interchangeable head concepts](/images/projects/pipe-cleaning-robot/diameter-adaptation.webp)
![Exploring pipe clearance and wheel positions](/images/projects/pipe-cleaning-robot/pipe-fit.webp)
![Cleaning assembly in relation to the pipe cross-section](/images/projects/pipe-cleaning-robot/front-view.webp)

The concept is approximately 600 mm long and targets drainage pipes with an internal diameter of around 200–250 mm. Water, power and communications would come from equipment above ground. Dimensions and operating capability still require validation with an engineering prototype.

## From control signals to wheel movement

The proposed drive system uses an Arduino UNO to send PWM and direction signals to a dual-channel motor driver, which controls motor speed and rotation. Separating control and actuation makes the path from input to wheel movement easier to understand.

![Control relationships between the Arduino UNO, motor driver and chassis](/images/projects/pipe-cleaning-robot/motor-control.webp)

![Mecanum wheels, chassis connections, axle transmission and scraping blades](/images/projects/pipe-cleaning-robot/chassis-details.webp)

## Sensing and visibility

The front camera and sensing module support observation inside the pipe, while headlights provide illumination. Pipe scanning, localisation and navigation remain proposed system capabilities that need sensor selection and whole-system testing.

![Front sensing module concept](/images/projects/pipe-cleaning-robot/sensing.webp)
![Concept illustration of scanning inside a pipe](/images/projects/pipe-cleaning-robot/pipe-scan.webp)

![Detail rendering of the camera and sensing module](/images/projects/pipe-cleaning-robot/sensor-detail.webp)

## Product presentation

The compact, faceted body separates the front cleaning assembly from the four-wheel chassis. Front lighting, an upper sensing module and twin rear nozzles create a legible functional layout.

![Front view: cleaning head, lights and chassis](/images/projects/pipe-cleaning-robot/front-render.webp)

![Rear view: twin nozzles and body structure](/images/projects/pipe-cleaning-robot/rear-render.webp)
