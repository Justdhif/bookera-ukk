import 'package:flutter/material.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "Library App",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.blue,
      ),
      // home: Teks welcome
      home: Scaffold(
        appBar: AppBar(
          title: const Text("Library App"),
        ),
        body: const Center(
          child: Text("Welcome to the Library App!"),
        ),
      ),
    );
  }
}