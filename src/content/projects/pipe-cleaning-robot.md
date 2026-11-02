## 从管道作业的真实流程出发

城市排水管道的清理通常包含定位堵塞点、人工或小型机械清淤、高压水枪冲洗，以及复查管道功能。有限的作业空间和难以直接观察的内部环境，增加了检查与维护的负担。

本方案将识别、清理、冲洗与复查串联起来，探索由地面人员操作、在管道内部执行任务的设备形态。

![传统人工与机械辅助清淤的场景研究](/images/projects/pipe-cleaning-robot/traditional-cleaning.webp)
![使用摄像探头定位管道堵塞点](/images/projects/pipe-cleaning-robot/locating.webp)
![小型机械辅助清淤的场景研究](/images/projects/pipe-cleaning-robot/assisted-cleaning.webp)
![作业完成后的管道复查](/images/projects/pipe-cleaning-robot/inspection.webp)

### 作业流程

1. 启动设备，进入管道。
2. 通过感知模块观察管内情况，识别堵塞区域。
3. 使用前端叶片清理管壁，配合高压喷头冲洗。
4. 复查管道情况并返回，供地面人员检查与维护。

## 紧凑机身与模块化清理结构

从草图推演开始，将机身、感知模块、清理头与四轮底盘组合为紧凑的产品架构。前端叶片负责机械清理，后部喷头回应冲洗需求；可更换清理头与分档高度调节用于探索不同管径下的适配方式。

![机身比例、轮组布局与前端清理头的草图推演](/images/projects/pipe-cleaning-robot/sketches.webp)

![分档底盘高度与不同清理头的适配研究](/images/projects/pipe-cleaning-robot/diameter-adaptation.webp)
![管内通过空间与轮组位置研究](/images/projects/pipe-cleaning-robot/pipe-fit.webp)
![清理机构与管道截面的位置关系](/images/projects/pipe-cleaning-robot/front-view.webp)

概念整机总长约 600 mm，目标为净内径约 200–250 mm 的排水管道。供水、供电与通信由地面设备提供，具体尺寸与作业能力仍需工程样机验证。

## 从控制指令到车轮运动

驱动方案以 Arduino UNO 为控制核心，通过 PWM 和方向信号向双路电机驱动模块发送指令，再控制电机的转速与转向。将控制与执行模块分开，有助于梳理从输入到电机动作的路径。

![Arduino UNO、双路电机驱动模块与底盘之间的控制关系](/images/projects/pipe-cleaning-robot/motor-control.webp)

![麦克纳姆轮、底盘连接、轮轴传动与刮壁叶片细节](/images/projects/pipe-cleaning-robot/chassis-details.webp)

## 感知模块与作业视野

前部摄像与感知模块用于观察管道内部，照明前灯为暗光环境下的检查提供条件。管道扫描、定位与导航属于系统设计方向，需通过后续传感器选型和整机测试验证。

![前部感知模块造型](/images/projects/pipe-cleaning-robot/sensing.webp)
![管道内扫描的概念示意](/images/projects/pipe-cleaning-robot/pipe-scan.webp)

![摄像与感知模块的局部渲染](/images/projects/pipe-cleaning-robot/sensor-detail.webp)

## 产品呈现

机身采用收拢的折面轮廓，将前端清理机构与四轮底盘分层组织。前侧照明、顶部感知模块和尾部双喷头共同构成可辨认的功能布局。

![管道清理者正面视角：清理头、照明与底盘](/images/projects/pipe-cleaning-robot/front-render.webp)

![管道清理者后侧视角：双喷头与机身结构](/images/projects/pipe-cleaning-robot/rear-render.webp)
