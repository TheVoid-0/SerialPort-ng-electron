#include <Arduino.h>

void setup()
{
  Serial.begin(115200);
  while (!Serial)
    ;
}

void loop()
{
  if (Serial.available())
  {
    String command = Serial.readStringUntil('\n');

    // Serial.printf("Command received %s \n", command);
    Serial.print("Recebi o comando: ");
    Serial.println(command);

    delay(1000);

    Serial.println("it23.35");
    Serial.println("a11");
  }
}