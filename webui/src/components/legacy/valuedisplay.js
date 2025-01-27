import React, { useEffect, useCallback } from "react";

import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

// An interactive display of the current values obtained by the backend.
const ValueDisplay = (props) => {
  const { emit, index, webUIDataRef, maxSize } = props;
  const thresholdLabelRef = React.useRef(null);
  const valueLabelRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const curValues = webUIDataRef.current.curValues;
  const curThresholds = webUIDataRef.current.curThresholds;

  const EmitValue = useCallback(
    (val) => {
      // Send back all the thresholds instead of a single value per sensor. This is in case
      // the server restarts where it would be nicer to have all the values in sync.
      // Still send back the index since we want to update only one value at a time
      // to the microcontroller.
      emit(["update_threshold", curThresholds, index]);
    },
    [curThresholds, emit, index]
  );

  useEffect(() => {
    let requestId;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const setDimensions = () => {
      // Adjust DPI so that all the edges are smooth during scaling.
      const dpi = window.devicePixelRatio || 1;

      canvas.width = canvas.clientWidth * dpi;
      canvas.height = canvas.clientHeight * dpi;
    };

    setDimensions();
    window.addEventListener("resize", setDimensions);

    // This is default React CSS font style.
    const bodyFontFamily = window
      .getComputedStyle(document.body)
      .getPropertyValue("font-family");
    const valueLabel = valueLabelRef.current;

    // cap animation to 60 FPS (with slight leeway because monitor refresh rates are not exact)
    const minFrameDurationMs = 1000 / 60.1;
    var previousTimestamp;

    const render = (timestamp) => {
      const oldest = webUIDataRef.current.oldest;

      if (
        previousTimestamp &&
        timestamp - previousTimestamp < minFrameDurationMs
      ) {
        requestId = requestAnimationFrame(render);
        return;
      }
      previousTimestamp = timestamp;

      // Get the latest value. This is either last element in the list, or based off of
      // the circular array.
      let currentValue = 0;
      if (curValues.length < maxSize) {
        currentValue = curValues[curValues.length - 1][index];
      } else {
        currentValue =
          curValues[(((oldest - 1) % maxSize) + maxSize) % maxSize][index];
      }

      // Add background fill.
      let grd = ctx.createLinearGradient(
        canvas.width / 2,
        0,
        canvas.width / 2,
        canvas.height
      );
      if (currentValue >= curThresholds[index]) {
        grd.addColorStop(0, "lightblue");
        grd.addColorStop(1, "blue");
      } else {
        grd.addColorStop(0, "lightblue");
        grd.addColorStop(1, "gray");
      }
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cur Value Label
      valueLabel.innerText = currentValue;

      // Bar
      const maxHeight = canvas.height;
      const position = Math.round(
        maxHeight - (currentValue / 1023) * maxHeight
      );
      grd = ctx.createLinearGradient(
        canvas.width / 2,
        canvas.height,
        canvas.width / 2,
        position
      );
      grd.addColorStop(0, "orange");
      grd.addColorStop(1, "red");
      ctx.fillStyle = grd;
      ctx.fillRect(canvas.width / 4, position, canvas.width / 2, canvas.height);

      // Threshold Line
      const threshold_height = 3;
      const threshold_pos =
        ((1023 - curThresholds[index]) / 1023) * canvas.height;
      ctx.fillStyle = "black";
      ctx.fillRect(
        0,
        threshold_pos - Math.floor(threshold_height / 2),
        canvas.width,
        threshold_height
      );

      // Threshold Label
      ctx.font = "5rem " + bodyFontFamily;
      ctx.fillStyle = "black";
      if (curThresholds[index] > 990) {
        ctx.textBaseline = "top";
      } else {
        ctx.textBaseline = "bottom";
      }
      ctx.fillText(
        curThresholds[index].toString(),
        0,
        threshold_pos + threshold_height + 1
      );

      requestId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(requestId);
      window.removeEventListener("resize", setDimensions);
    };
  }, [EmitValue, curThresholds, curValues, index, webUIDataRef, maxSize]);

  const updateThreshold = (e) => {
    const val = parseInt(e.target.value);
    if (e.keyCode === 13 && val >= 0 && val <= 1023) {
      curThresholds[index] = val;
      EmitValue(val);
      e.target.value = val;
    }
  };

  return (
    <Col className="ValueMonitor-col">
      <div className="threshold-wrapper">
        Threshold:
        <input
          type="text"
          className="ValueMonitor-label"
          defaultValue={curThresholds[index]}
          onKeyDown={(e) => updateThreshold(e)}
          ref={thresholdLabelRef}
        />
      </div>
      <div className="num-wrapper">
        Value:
        <Form.Label className="ValueMonitor-label" ref={valueLabelRef}>
          0
        </Form.Label>
      </div>
      <canvas className="ValueMonitor-canvas" ref={canvasRef} />
    </Col>
  );
};

export default ValueDisplay;
