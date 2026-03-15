import SecComponent from "@/components/SecContainer";
import { HEADING } from "@/constants/style.constants";
import { AspectRatio, Box, Grid, Heading, Strong, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

export default function AboutSection() {

  return (
    <SecComponent>
      <Grid columns={"3"} rows={"1"} gap={{ lg: "6" }}>

        {/* Image */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <AspectRatio ratio={4 / 5} >
            <motion.img
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6 }}

              className="w-full h-full  drop-shadow-[0_0_15px_color-mix(in_srgb,var(--blue-3),transparent_10%)]"
              src="/images/zia.png"
              title="My picture"
              alt="my image"
            />
          </AspectRatio>
        </MotionBox>

        {/* Text */}
        <MotionBox
          className="col-span-2 space-y-4 flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <MotionHeading
            as="h2"
            size={HEADING.h2.size}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            About Me
          </MotionHeading>

          <MotionText size={{ initial: "1", lg: "2" }}>
            Hi, I'm&nbsp;
            <Strong className="text-(--blue-a12)">Zia</Strong>, a&nbsp;
            <Strong className="text-(--blue-a12)">Full-Stack Developer</Strong> who builds&nbsp;
            <Strong className="text-(--blue-a12)">
              fast, scalable web applications
            </Strong>. I work primarily with&nbsp;
            <Strong className="text-(--blue-a12)">React</Strong>,&nbsp;
            <Strong className="text-(--blue-a12)">Node.js</Strong>,&nbsp;
            <Strong className="text-(--blue-a12)">PHP</Strong>, and&nbsp;
            <Strong className="text-(--blue-a12)">Laravel</Strong> to create modern
            digital products.

            My focus is on&nbsp;
            <Strong className="text-(--blue-a12)">clean architecture</Strong>,&nbsp;
            <Strong className="text-(--blue-a12)">performance optimization</Strong>, and&nbsp;
            <Strong className="text-(--blue-a12)">maintainable code</Strong>.

            I enjoy&nbsp;
            <Strong className="text-(--blue-a12)">solving complex problems</Strong>&nbsp;
            and turning ideas into&nbsp;
            <Strong className="text-(--blue-a12)">reliable web solutions</Strong>. I
            aim to build applications that are both&nbsp;
            <Strong className="text-(--blue-a12)">efficient</Strong> and&nbsp;
            <Strong className="text-(--blue-a12)">user-focused</Strong>.
          </MotionText>
        </MotionBox>
      </Grid>
    </SecComponent>
  );
}