package gordo.peluche.Entidades;

import jakarta.persistence.*;

@Entity
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private string nombre;
    private float precio;
    private int stock;

    @ManyToMany(mappedBy = "productos")
    private List<Compra>compra;

}
