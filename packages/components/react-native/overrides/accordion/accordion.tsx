import React, { forwardRef, useState, useId } from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import DBAccordionItem from "../accordion-item/accordion-item";
import { DBAccordionItemDefaultProps } from "../accordion-item/model";
import { DBAccordionProps } from "./model";

function DBAccordionFn(props: DBAccordionProps, component: any) {
  const uuid = useId();
  const name = props.name ?? `acc-${uuid}`;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function convertItems(): DBAccordionItemDefaultProps[] {
    try {
      if (typeof props.items === "string") return JSON.parse(props.items);
      return (props.items as DBAccordionItemDefaultProps[]) ?? [];
    } catch { return []; }
  }

  const items = convertItems();

  function handleToggle(index: number) {
    setOpenIndex((prev) => {
      const next = prev === index ? null : index;
      return next;
    });
  }

  return (
    <View style={styles.container} ref={component}>
      {items.length > 0
        ? items.map((item, i) => (
            <DBAccordionItem
              key={`${name}-${i}`}
              open={props.behavior === "single" ? openIndex === i : (item as any).open}
              onToggle={() => handleToggle(i)}
              {...item}
            />
          ))
        : props.children}
    </View>
  );
}

const styles = StyleSheet.create({ container: {} });

const DBAccordion = forwardRef<View, DBAccordionProps>(DBAccordionFn);
export default DBAccordion;
